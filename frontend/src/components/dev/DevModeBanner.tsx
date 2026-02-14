"use client";

import { signIn } from "next-auth/react";
import { DEV_PASSWORD, DEV_LOCADOR_EMAIL, DEV_LOCATARIO_EMAIL, isDevModeClient } from "@/lib/dev-mode";

export function DevModeBanner() {
  if (!isDevModeClient()) return null;

  function enterAsLocador() {
    void signIn("credentials", {
      email: DEV_LOCADOR_EMAIL,
      password: DEV_PASSWORD,
      callbackUrl: "/dashboard-proprietario",
    });
  }

  function enterAsLocatario() {
    void signIn("credentials", {
      email: DEV_LOCATARIO_EMAIL,
      password: DEV_PASSWORD,
      callbackUrl: "/dashboard-inquilino",
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
      <p className="text-xs text-amber-800 dark:text-amber-200">Dois usuários (senha: dev)</p>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={enterAsLocador}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Entrar como Locador
        </button>
        <button
          type="button"
          onClick={enterAsLocatario}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Entrar como Locatário
        </button>
      </div>
    </div>
  );
}
