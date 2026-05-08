import { prisma } from "@/lib/prisma";

async function main() {
  // Normalize legacy Task documents with priority = "URGENT" to a valid enum value.
  // We map "URGENT" to the highest supported priority: "HIGH".
  try {
    const result = await prisma.$runCommandRaw({
      update: "Task",
      updates: [
        {
          q: { priority: "URGENT" },
          u: { $set: { priority: "HIGH" } },
          multi: true,
        },
      ],
    });

    // eslint-disable-next-line no-console
    console.log('Updated Task priority "URGENT" -> "HIGH":', result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fix Task priority URGENT:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});



