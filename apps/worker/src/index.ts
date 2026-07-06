import "dotenv/config";

console.log("cwd:", process.cwd());
console.log("SMTP_ENDPOINT:", process.env.SMTP_ENDPOINT);
console.log("SMTP_USERNAME:", process.env.SMTP_USERNAME);
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "loaded" : "missing");
console.log("SMTP_FROM:", process.env.SMTP_FROM);

import { PrismaClient, Prisma } from "db";

import { Kafka } from "kafkajs";
import { parse } from "./parser.js";
import { sendEmail } from "./email.js";

const prismaClient = new PrismaClient();

const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor-2",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({
    groupId: "main-worker-3",
  });

  const producer = kafka.producer();

  console.log("Connecting consumer...");
  await consumer.connect();

  console.log("Connecting producer...");
  await producer.connect();

  console.log("Subscribing...");
  await consumer.subscribe({
    topic: TOPIC_NAME,
    fromBeginning: false,
  });

  console.log("Worker ready");

  await consumer.run({
    autoCommit: false,

    eachMessage: async ({ partition, message }) => {
      try {
        console.log("--------------------------------");
        console.log("Message received");

        const value = message.value?.toString();

        console.log({
          partition,
          offset: message.offset,
          value,
        });

        if (!value) {
          console.log("Empty message");
          return;
        }

        const parsedValue = JSON.parse(value);

        console.log(parsedValue);

        const zapRunId = parsedValue.zapRunId;
        const stage = parsedValue.stage;

        console.log("Fetching zap run...");

        const zapRunDetails = await prismaClient.zapRun.findFirst({
          where: {
            id: zapRunId,
          },
          include: {
            zap: {
              include: {
                actions: {
                  include: {
                    type: true,
                  },
                },
              },
            },
          },
        });

        if (!zapRunDetails) {
          console.log("ZapRun not found");
          return;
        }

        console.log("ZapRun found");

        const currentAction = zapRunDetails.zap.actions.find(
          (x) => x.sortingOrder === stage
        );

        if (!currentAction) {
          console.log("Current action not found");
          return;
        }

        console.log("Current action:", currentAction.type.id);

        const metadata = zapRunDetails.metadata;

        if (currentAction.type.id === "9e44178d-d37c-4007-86eb-cf71c83d8d09") {
          const body = (currentAction.metadata as Prisma.JsonObject).body as string;

          const to = parse(
            (currentAction.metadata as Prisma.JsonObject).email as string,
            metadata
          );

          const subject = parse(
            (currentAction.metadata as Prisma.JsonObject).subject as string,
            metadata
          );

          console.log("Sending email...");
          console.log({
            to,
            subject,
            body,
          });

          await sendEmail(to, body, subject);

          console.log("Email finished");
        }

        await new Promise((r) => setTimeout(r, 500));

        const lastStage = zapRunDetails.zap.actions.length - 1;

        console.log({
          stage,
          lastStage,
        });

        if (stage !== lastStage) {
          console.log("Sending next stage");

          await producer.send({
            topic: TOPIC_NAME,
            messages: [
              {
                value: JSON.stringify({
                  stage: stage + 1,
                  zapRunId,
                }),
              },
            ],
          });
        }

        await consumer.commitOffsets([
          {
            topic: TOPIC_NAME,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);

        console.log("Offset committed");
        console.log("Done");
      } catch (err) {
        console.error("Worker crashed while processing message");
        console.error(err);
      }
    },
  });
}

main().catch(console.error);