function getEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v == null || v === "") throw new Error(`Missing env: ${key}`);
  return v;
}

/** Resolve DATABASE_URL: use DATABASE_URL, or DATABASE_URL_DEV / DATABASE_URL_PROD by NODE_ENV. */
function getDatabaseUrl(): string {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const url =
    process.env.DATABASE_URL ??
    (nodeEnv === "production" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV);
  if (!url || url === "") throw new Error("Missing DATABASE_URL or (DATABASE_URL_DEV / DATABASE_URL_PROD)");
  return url;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: getDatabaseUrl(),
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((s) => s.trim()),
  INTERNAL_API_KEY: getEnv("INTERNAL_API_KEY"),
} as const;
