function getEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v == null || v === "") throw new Error(`Missing env: ${key}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: getEnv("DATABASE_URL"),
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((s) => s.trim()),
  INTERNAL_API_KEY: getEnv("INTERNAL_API_KEY"),
} as const;
