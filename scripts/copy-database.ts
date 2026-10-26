import { PrismaClient } from "@prisma/client";
import { getMigrationUrls, loadMigrationEnv } from "./migration-env";

const modelNames = [
  // Insert referenced records before dependent records.
  "adminUser",
  "brand",
  "category",
  "product",
  "adminDevice",
  "productImage",
  "otpToken",
  "galleryImage",
  "heroImage",
  "instagramReel",
  "fAQ",
  "service",
  "offer",
  "storeSettings",
] as const;

type ModelName = (typeof modelNames)[number];
type ModelDelegate = {
  count(): Promise<number>;
  findMany(): Promise<unknown[]>;
  createMany(args: { data: unknown[] }): Promise<{ count: number }>;
};
type ModelClient = Record<ModelName, ModelDelegate>;

async function main() {
  loadMigrationEnv();

  const { sourceUrl, targetUrl } = getMigrationUrls();

  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });
  const sourceModels = source as unknown as ModelClient;
  const targetModels = target as unknown as ModelClient;

  try {
    const targetCounts = await Promise.all(modelNames.map((name) => targetModels[name].count()));
    const populatedTarget = modelNames
      .map((name, index) => ({ name, count: targetCounts[index] }))
      .filter(({ count }) => count > 0);

    if (populatedTarget.length > 0) {
      const summary = populatedTarget.map(({ name, count }) => `${name}=${count}`).join(", ");
      throw new Error(`Target database is not empty (${summary}). Copy cancelled to prevent overwriting data.`);
    }

    const sourceData = new Map<ModelName, unknown[]>();
    for (const name of modelNames) {
      sourceData.set(name, await sourceModels[name].findMany());
    }

    await target.$transaction(async (transaction) => {
      const transactionModels = transaction as unknown as ModelClient;
      for (const name of modelNames) {
        const rows = sourceData.get(name)!;
        if (rows.length === 0) continue;

        const result = await transactionModels[name].createMany({ data: rows });
        if (result.count !== rows.length) {
          throw new Error(`Copied ${result.count} of ${rows.length} ${name} records.`);
        }
      }
    }, { maxWait: 15_000, timeout: 600_000 });

    console.log("Database copy completed:");
    for (const name of modelNames) {
      console.log(`  ${name}: ${sourceData.get(name)!.length}`);
    }
  } finally {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  }
}

main().catch((error: unknown) => {
  console.error("Database copy failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
