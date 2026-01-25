"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { authApi } from "@/lib/api-client";
import { Logo } from "@/components/brand/Logo";

function passwordStrength(pwd: string): { label: string; level: number } {
  if (!pwd) return { label: "Digite uma senha", level: 0 };
  let level = 0;
  if (pwd.length >= 8) level++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) level++;
  if (/\d/.test(pwd)) level++;
  if (/[^a-zA-Z0-9]/.test(pwd)) level++;
  const labels = ["Fraca", "Regular", "Boa", "Forte"];
  return { label: labels[Math.min(level, 3)], level: Math.min(level, 4) };
}

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

  const pwdStrength = useMemo(() => passwordStrength(password), [password]);

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
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-gray-800 bg-white dark:bg-background-dark">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="text-xl" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="#como-funciona" className="text-sm font-medium text-muted hover:text-primary">Como funciona</Link>
          <Link href="#seguranca" className="text-sm font-medium text-muted hover:text-primary">Segurança</Link>
          <Link href="#" className="text-sm font-medium text-muted hover:text-primary">Ajuda</Link>
          <Link href="/login" className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90">Entrar</Link>
        </nav>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-2/5 bg-primary text-white items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Aluguel direto, seguro e sem burocracia.</h1>
          <p className="text-xl text-white/80 mb-10">
            Sua infraestrutura digital completa para contratos, vistorias e pagamentos automatizados.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="font-bold">Contratos com validade jurídica</p>
                <p className="text-blue-100 text-sm">Assinatura digital integrada e segura.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <p className="font-bold">Pagamentos Automatizados</p>
                <p className="text-blue-100 text-sm">Receba e pague sem se preocupar com boletos.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">assignment</span>
              </div>
              <div>
                <p className="font-bold">Vistorias Digitais</p>
                <p className="text-blue-100 text-sm">Proteção total para proprietários e inquilinos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[520px]">
          <div className="mb-6">
            <p className="text-sm font-medium text-muted dark:text-gray-400 mb-1">Passo 1 de 2</p>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-primary rounded-full" />
            </div>
            <p className="text-xs text-muted mt-1">50%</p>
          </div>
          <p className="text-sm font-semibold text-primary mb-2">Informações de Cadastro</p>
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
              <label className="block text-sm font-bold text-[#111318] dark:text-gray-200 mb-2">CPF</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="flex-1 min-w-[200px] h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="000.000.000-00"
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Dados Criptografados
                </span>
                {cpf.replace(/\D/g, "").length >= 11 && (
                  <span className="material-symbols-outlined text-green-600" title="CPF válido">check_circle</span>
                )}
              </div>
              <div className="mt-2 flex gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <span className="material-symbols-outlined text-muted shrink-0 text-lg">info</span>
                <p className="text-xs text-muted dark:text-gray-400">
                  O CPF é necessário para validar sua identidade e garantir que os contratos gerados tenham validade jurídica total perante a lei.
                </p>
              </div>
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
              {password && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted dark:text-gray-400 mb-1">FORÇA DA SENHA: {pwdStrength.label.toUpperCase()}</p>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 ${i <= pwdStrength.level ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
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
                Eu li e aceito os <Link href="/termos" className="text-primary font-bold hover:underline">Termos de Uso</Link> e a <Link href="/termos" className="text-primary font-bold hover:underline">Política de Privacidade</Link> da plataforma.
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
    </div>
  );
}
