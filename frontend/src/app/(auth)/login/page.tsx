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
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-12">
            <Logo light className="text-2xl" />
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">Segurança jurídica em cada clique.</h1>
          <p className="text-xl text-blue-50 mb-10">
            Infraestrutura digital para contratos, vistorias e pagamentos residenciais diretos. Alugue sem intermediários, com proteção.
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border dark:border-gray-700 bg-white dark:bg-gray-800 h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Sua senha"
                required
              />
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
          <p className="mt-10 text-center text-muted dark:text-gray-400 text-sm">
            Ainda não tem uma conta? <Link href="/criar-conta" className="text-primary font-bold hover:underline">Criar conta gratuita</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
