"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard-proprietario";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Erro ao entrar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-blue-900 opacity-90" />
        <div className="relative z-10 max-w-lg text-white flex flex-col h-full justify-center">
          <div className="mb-12">
            <Logo light className="text-2xl" />
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">Segurança jurídica em cada clique.</h1>
          <p className="text-xl text-blue-50 mb-10">
            Sua infraestrutura digital completa para contratos, vistorias e pagamentos residenciais diretos. Alugue sem intermediários, mas com total proteção.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="font-bold text-white">Contratos Digitais</p>
                <p className="text-blue-100 text-sm">Validade jurídica garantida e assinaturas rápidas.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div>
                <p className="font-bold text-white">Pagamentos Seguros</p>
                <p className="text-blue-100 text-sm">Gestão financeira automatizada e transparente.</p>
              </div>
            </div>
          </div>
          <p className="mt-12 flex items-center gap-2 text-sm text-blue-100">
            <span className="material-symbols-outlined text-base">lock</span>
            Criptografia de ponta a ponta e conformidade com a LGPD
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white dark:bg-background-dark">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex justify-center mb-10">
            <Logo className="text-xl" />
          </div>
          <div className="mb-10">
            <h2 className="text-3xl font-bold dark:text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-muted dark:text-gray-400">Acesse sua conta para gerenciar seus imóveis e contratos.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink dark:text-gray-200 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border dark:border-gray-700 bg-white dark:bg-gray-800 h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-ink dark:text-gray-200">Senha</label>
                <Link href="#" className="text-primary text-sm font-semibold hover:underline">Esqueci minha senha</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border dark:border-gray-700 bg-white dark:bg-gray-800 h-12 px-4 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:hover:text-gray-300 p-1"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all disabled:opacity-70"
            >
              {loading ? "Entrando…" : "Entrar na plataforma"}
            </button>
          </form>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-gray-700" />
            </div>
            <p className="relative flex justify-center text-xs font-medium uppercase tracking-wide text-muted dark:text-gray-500">
              <span className="bg-white dark:bg-background-dark px-3">Ou entre com</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-ink dark:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn("linkedin", { callbackUrl })}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-ink dark:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
          </div>
          <p className="mt-10 text-center text-muted dark:text-gray-400 text-sm">
            Ainda não tem uma conta? <Link href="/criar-conta" className="text-primary font-bold hover:underline">Criar conta gratuita</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
