"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { DEV_EMAIL, DEV_PASSWORD, isDevModeClient, isDevUser } from "@/lib/dev-mode";

export function AppHeader() {
  const { data: session } = useSession();
  const devMode = isDevModeClient() && isDevUser(session?.user?.email);
  const role = (session?.user as { role?: string })?.role as string | undefined;
  const isProprietario = role === "PROPRIETARIO";
  const isInquilino = role === "INQUILINO";
  const defaultDashboard = isInquilino ? "/dashboard-inquilino" : "/dashboard-proprietario";

  function switchPersona(next: "PROPRIETARIO" | "INQUILINO") {
    void signIn("credentials", {
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      role: next,
      callbackUrl: next === "PROPRIETARIO" ? "/dashboard-proprietario" : "/dashboard-inquilino",
    });
  }

  const name = session?.user?.name ?? "";
  const initials = name ? name[0].toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border dark:border-gray-800 bg-white dark:bg-background-dark">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-3 flex items-center justify-between flex-nowrap gap-4">
        <Link href={defaultDashboard} className="flex items-center gap-2 text-ink dark:text-white">
          <Logo className="text-xl" />
        </Link>
        <nav className="flex items-center gap-4 md:gap-6 flex-wrap">
          {devMode && (
            <div className="inline-flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-yellow-300 dark:bg-yellow-500/80 text-gray-700 dark:text-gray-900">
                DEV
              </span>
              <div className="inline-flex rounded-lg border border-amber-200/80 dark:border-amber-700/50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => switchPersona("PROPRIETARIO")}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                    role === "PROPRIETARIO"
                      ? "bg-orange-500 text-white"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200/80 dark:hover:bg-amber-800/40"
                  }`}
                >
                  Proprietário
                </button>
                <button
                  type="button"
                  onClick={() => switchPersona("INQUILINO")}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                    role === "INQUILINO"
                      ? "bg-orange-500 text-white"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200/80 dark:hover:bg-amber-800/40"
                  }`}
                >
                  Inquilino
                </button>
              </div>
            </div>
          )}
          {isProprietario && (
            <>
              <Link href="/imoveis" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Imóveis</Link>
              <Link href="/contratos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Contratos</Link>
              <Link href="/pagamentos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Pagamentos</Link>
              <Link href="#" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Mensagens</Link>
            </>
          )}
          {isInquilino && (
            <>
              <Link href="/dashboard-inquilino" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Meu Aluguel</Link>
              <Link href="/buscar-imoveis" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Buscar imóveis</Link>
              <Link href="/pagamentos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Pagamentos</Link>
              <Link href="#" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Solicitações</Link>
              <Link href="#" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Documentos</Link>
            </>
          )}
          {!isProprietario && !isInquilino && (
            <>
              <Link href="/imoveis" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Imóveis</Link>
              <Link href="/contratos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Contratos</Link>
              <Link href="/pagamentos" className="text-sm font-medium text-muted dark:text-gray-400 hover:text-primary">Pagamentos</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href="/perfil" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-muted dark:text-gray-400" title="Meus dados (contrato)" aria-label="Meus dados">
            <span className="material-symbols-outlined">person</span>
          </Link>
          <div className="relative shrink-0" title={session?.user?.name ?? "Usuário"}>
            <div className="w-9 h-9 rounded-full border-2 border-sky-300 dark:border-sky-600 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-400 dark:bg-sky-500 border-2 border-white dark:border-background-dark" aria-hidden />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary ml-0.5"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
