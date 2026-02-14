declare module "prisma/config" {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
  export function env(key: string): string;
}
