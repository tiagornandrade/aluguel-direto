"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";
import { DEV_EMAIL, DEV_PASSWORD, isDevModeClient, isDevUser } from "@/lib/dev-mode";

export function AppHeader() {
  const { data: session } = useSession();
  const devMode = isDevModeClient() && isDevUser(session?.user?.email);
  const role = (session?.user as { role?: string })?.role;

  function switchPersona(next: "PROPRIETARIO" | "INQUILINO") {
    void signIn("credentials", {
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      role: next,
      callbackUrl: next === "PROPRIETARIO" ? "/dashboard-proprietario" : "/dashboard-inquilino",
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border dark:border-gray-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-3 flex items-center justify-between flex-wrap gap-4">
        <Link href="/dashboard-proprietario" className="flex items-center gap-2 text-ink dark:text-white">
          <Logo className="text-xl" />
        </Link>
        <nav className="flex items-center gap-4 md:gap-8 flex-wrap">
          {devMode ? (
            <div className="flex items-center gap-1 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 px-1 py-0.5">
              <span className="mr-1.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Dev</span>
              <button
                type="button"
                onClick={() => switchPersona("PROPRIETARIO")}
                className={`rounded-md px-2 py-1 text-sm font-semibold transition-colors ${
                  role === "PROPRIETARIO"
                    ? "bg-amber-500 text-white"
                    : "text-amber-800 hover:bg-amber-200/80 dark:text-amber-200 dark:hover:bg-amber-800/50"
                }`}
              >
                Proprietário
              </button>
              <button
                type="button"
                onClick={() => switchPersona("INQUILINO")}
                className={`rounded-md px-2 py-1 text-sm font-semibold transition-colors ${
                  role === "INQUILINO"
                    ? "bg-amber-500 text-white"
                    : "text-amber-800 hover:bg-amber-200/80 dark:text-amber-200 dark:hover:bg-amber-800/50"
                }`}
              >
                Inquilino
              </button>
            </div>
          ) : (
            <>
              <Link href="/dashboard-proprietario" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">
                Proprietário
              </Link>
              <Link href="/dashboard-inquilino" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">
                Inquilino
              </Link>
            </>
          )}
          <Link href="/imoveis" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">
            Imóveis
          </Link>
          <Link href="/contratos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">
            Contratos
          </Link>
          <Link href="/pagamentos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">
            Pagamentos
          </Link>
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
