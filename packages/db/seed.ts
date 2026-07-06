import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

async function main() {
  await prismaClient.availableTriggers.createMany({
    data: [
      {
        name: "Webhook",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIovxkR9l-OlwpjTXV1B4YNh0W_s618ijxAQ&s",
      },
    ],
    skipDuplicates: true,
  });

  await prismaClient.availableActions.createMany({
    data: [
      {
        name: "Send Email",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4nd82eFk5SaBPRIeCpmwL7A4YSokA-kXSmw&s",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });