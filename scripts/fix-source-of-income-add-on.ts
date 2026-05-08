import { prisma } from "@/lib/prisma";

async function main() {
  // Normalize any legacy documents with type = "ADD_ON" to a valid enum value
  // We choose SUBSCRIPTION as the safest default for now.
  try {
    const result = await prisma.$runCommandRaw({
      update: "SourceOfIncome",
      updates: [
        {
          q: { type: "ADD_ON" },
          u: { $set: { type: "SUBSCRIPTION" } },
          multi: true,
        },
      ],
    });

    // eslint-disable-next-line no-console
    console.log("Updated SourceOfIncome ADD_ON rows -> SUBSCRIPTION:", result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fix SourceOfIncome type ADD_ON:", error);
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



