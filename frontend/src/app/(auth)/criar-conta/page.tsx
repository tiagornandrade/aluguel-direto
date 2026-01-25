"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { authApi } from "@/lib/api-client";

export default function CriarContaPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PROPRIETARIO" | "INQUILINO">("PROPRIETARIO");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) {
      setError("Aceite os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.register({
        email,
        fullName,
        cpf: cpf.trim() || null,
        password,
        role,
      });
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-primary text-white items-center justify-center p-12">
        <div>
          <h1 className="text-4xl font-bold mb-6">Aluguel direto, seguro e sem burocracia.</h1>
          <p className="text-xl text-white/80 max-w-lg">
            Infraestrutura digital para contratos, vistorias e pagamentos automatizados.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[520px]">
          <h2 className="text-3xl font-bold dark:text-white mb-2">Crie sua conta</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Junte-se a milhares de pessoas alugando de forma inteligente.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-[#111318] dark:text-gray-200 mb-2">Tipo de Perfil</label>
              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => setRole("PROPRIETARIO")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    role === "PROPRIETARIO" ? "bg-primary text-white shadow" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Sou Proprietário
                </button>
                <button
                  type="button"
                  onClick={() => setRole("INQUILINO")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    role === "INQUILINO" ? "bg-accent text-white shadow" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Sou Inquilino
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111318] dark:text-gray-200 mb-2">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Como no seu RG/CNH"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111318] dark:text-gray-200 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="exemplo@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111318] dark:text-gray-200 mb-2">CPF (opcional)</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111318] dark:text-gray-200 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                Li e aceito os <Link href="/termos" className="text-primary font-bold hover:underline">Termos de Uso</Link> e a <Link href="/termos" className="text-primary font-bold hover:underline">Política de Privacidade</Link>.
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-bold rounded-xl text-lg hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "Criando…" : "Criar Minha Conta"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
          <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            Já tem uma conta? <Link href="/login" className="text-primary font-bold hover:underline">Entre aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
