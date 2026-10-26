import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { getMigrationUrls, loadMigrationEnv } from "./migration-env";

loadMigrationEnv();
const { targetUrl } = getMigrationUrls();
const prismaCli = resolve("node_modules/prisma/build/index.js");

const result = spawnSync(process.execPath, [prismaCli, "db", "push"], {
  cwd: process.cwd(),
  env: { ...process.env, DATABASE_URL: targetUrl },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
