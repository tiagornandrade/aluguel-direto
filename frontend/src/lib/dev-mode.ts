/**
 * Dev mode: when enabled, allows signing in with dev credentials (no backend)
 * and switching between Proprietário/Inquilino personas.
 *
 * Enable with DEV_MODE=true or NEXT_PUBLIC_DEV_MODE=true in .env.local.
 * next.config propagates DEV_MODE to NEXT_PUBLIC_DEV_MODE.
 */

export const DEV_EMAIL = "dev@alugueldireto.local";
export const DEV_PASSWORD = "dev";

/** Server-side: true when dev mode is enabled (auth, API routes, middleware). */
export function isDevMode(): boolean {
  return (
    process.env.DEV_MODE === "true" ||
    process.env.DEV_MODE === "1" ||
    process.env.NEXT_PUBLIC_DEV_MODE === "true" ||
    process.env.NEXT_PUBLIC_DEV_MODE === "1" ||
    (process.env.NODE_ENV === "development" && !process.env.VERCEL)
  );
}

/** Client-side: true when NEXT_PUBLIC_DEV_MODE is set. */
export function isDevModeClient(): boolean {
  const v = process.env.NEXT_PUBLIC_DEV_MODE;
  return v === "true" || v === "1";
}

export function isDevUser(email: string | null | undefined): boolean {
  return email === DEV_EMAIL;
}
