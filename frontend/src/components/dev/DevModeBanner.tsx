"use client";

import { signIn } from "next-auth/react";
import { DEV_EMAIL, DEV_PASSWORD, isDevModeClient } from "@/lib/dev-mode";

export function DevModeBanner() {
  if (!isDevModeClient()) return null;

  function enterAs(role: "PROPRIETARIO" | "INQUILINO") {
    void signIn("credentials", {
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      role,
      callbackUrl: role === "PROPRIETARIO" ? "/dashboard-proprietario" : "/dashboard-inquilino",
    });
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 rounded-xl border border-amber-400/60 bg-amber-50/95 px-4 py-3 shadow-lg dark:border-amber-600/50 dark:bg-amber-950/95"
      data-testid="dev-mode-banner"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        Modo desenvolvimento
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => enterAs("PROPRIETARIO")}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Entrar como Proprietário
        </button>
        <button
          type="button"
          onClick={() => enterAs("INQUILINO")}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Entrar como Inquilino
        </button>
      </div>
    </div>
  );
}
