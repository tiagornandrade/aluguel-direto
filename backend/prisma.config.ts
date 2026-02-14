import "dotenv/config";
import { defineConfig } from "prisma/config";

const nodeEnv = process.env.NODE_ENV ?? "development";
const databaseUrl =
  process.env.DATABASE_URL ??
  (nodeEnv === "production" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV);
if (!databaseUrl) throw new Error("Missing DATABASE_URL or (DATABASE_URL_DEV / DATABASE_URL_PROD)");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.js" },
  datasource: { url: databaseUrl },
});
