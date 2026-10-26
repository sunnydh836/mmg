import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadMigrationEnv() {
  const envFile = join(process.cwd(), ".env.migration");
  if (!existsSync(envFile)) {
    throw new Error("Create .env.migration from .env.migration.example and fill in the database URLs.");
  }

  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(SOURCE_DATABASE_URL|TARGET_DATABASE_URL)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;

    const value = match[2].replace(/^(["'])(.*)\1$/, "$2");
    process.env[match[1]] = value;
  }
}

export function getMigrationUrls() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const targetUrl = process.env.TARGET_DATABASE_URL;
  if (!sourceUrl || !targetUrl) {
    throw new Error("Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL in .env.migration.");
  }
  if (sourceUrl === targetUrl) {
    throw new Error("Source and target URLs are identical; refusing to copy.");
  }

  return { sourceUrl, targetUrl };
}
