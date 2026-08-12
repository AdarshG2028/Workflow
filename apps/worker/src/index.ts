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
// import { appendRowToSheet } from "./google-sheets.js"; // Google Sheets not in use yet
import { appendToNotionPage } from "./notion.js";

const prismaClient = new PrismaClient();

const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor-2",
  brokers: process.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"],
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

        if (currentAction.type.name === "Send Email") {
          const body = parse(
            (currentAction.metadata as Prisma.JsonObject).body as string,
            metadata
          );

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

        // Google Sheets not in use yet — see google-sheets.ts
        // if (currentAction.type.name === "Update Google Sheet") {
        //   const spreadsheetId = parse(
        //     (currentAction.metadata as Prisma.JsonObject).spreadsheetId as string,
        //     metadata
        //   );

        //   const range = parse(
        //     (currentAction.metadata as Prisma.JsonObject).range as string,
        //     metadata
        //   );

        //   // Build row data with name, timestamp, and additional metadata
        //   const rowData = [
        //     parse(
        //       (currentAction.metadata as Prisma.JsonObject).name as string,
        //       metadata
        //     ),
        //     new Date().toISOString(),
        //     JSON.stringify(metadata),
        //   ];

        //   console.log("Appending row to Google Sheet...");
        //   console.log({
        //     spreadsheetId,
        //     range,
        //     rowData,
        //   });

        //   await appendRowToSheet(spreadsheetId, range, [rowData]);

        //   console.log("Google Sheet update finished");
        // }

        if (currentAction.type.name === "Append to Notion") {
          const pageId = parse(
            (currentAction.metadata as Prisma.JsonObject).pageId as string,
            metadata
          );

          const content = parse(
            (currentAction.metadata as Prisma.JsonObject).content as string,
            metadata
          );

          console.log("Appending to Notion page...");
          console.log({
            pageId,
            content,
          });

          await appendToNotionPage(pageId, content);

          console.log("Notion append finished");
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