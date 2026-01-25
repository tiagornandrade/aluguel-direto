import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardInquilinoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = (session.user as { name?: string }).name ?? "Inquilino";

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink dark:text-white">Olá, {name}</h1>
        <p className="mt-2 text-[#636f88] dark:text-gray-400">Bem-vindo ao seu dashboard de aluguel. Tudo parece em ordem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Próximo Aluguel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row">
            <div className="sm:w-48 h-40 sm:h-auto sm:min-h-[180px] bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">apartment</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-gray-500">Próximo Aluguel</p>
                <p className="text-2xl font-bold dark:text-white mt-1">R$ 2.500,00</p>
                <p className="text-sm text-muted dark:text-gray-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">event</span>
                  Vencimento em 05/11/2023
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                  Copiar Pix/Boleto
                </button>
                <Link href="/pagamentos" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800">
                  Ver Detalhes
                </Link>
              </div>
            </div>
          </div>

          {/* Resumo do Imóvel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-5">
            <h2 className="text-lg font-bold dark:text-white mb-4">Resumo do Imóvel</h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <span className="material-symbols-outlined text-muted shrink-0">location_on</span>
                  <div>
                    <p className="font-medium dark:text-white">Rua das Flores, 123 - Apto 42</p>
                    <p className="text-sm text-muted dark:text-gray-400">São Paulo, SP - CEP 01234-567</p>
                  </div>
                </div>
                <button type="button" className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800">
                  <span className="material-symbols-outlined text-lg">map</span>
                  Mapa
                </button>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <span className="material-symbols-outlined text-muted shrink-0">person</span>
                  <div>
                    <p className="font-medium dark:text-white">Proprietário: Carlos Alberto</p>
                    <p className="text-sm text-muted dark:text-gray-400">Contrato iniciado em Jan 2023</p>
                  </div>
                </div>
                <Link href="/contratos" className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800">
                  <span className="material-symbols-outlined text-lg">description</span>
                  Ver Contrato
                </Link>
              </div>
            </div>
          </div>

          {/* Solicitações Recentes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold dark:text-white">Solicitações Recentes</h2>
              <Link href="#" className="text-primary text-sm font-semibold hover:underline">Nova Solicitação</Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <span className="material-symbols-outlined text-amber-500">build</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium dark:text-white">Reparo na infiltração (Banheiro)</p>
                  <p className="text-sm text-muted dark:text-gray-400">Aberto em 24/10/2023</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Em andamento</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <span className="material-symbols-outlined text-green-500">key</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium dark:text-white">Cópia extra de chaves (Portaria)</p>
                  <p className="text-sm text-muted dark:text-gray-400">Finalizado em 15/10/2023</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Concluído</span>
              </div>
            </div>
            <p className="text-center mt-3">
              <Link href="#" className="text-primary text-sm font-semibold hover:underline">Ver todas as solicitações</Link>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Central de Ajuda */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-5">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">help</span>
              Central de Ajuda
            </h2>
            <p className="text-sm text-muted dark:text-gray-400 mb-4">Dúvidas sobre o seu contrato ou sobre o uso da plataforma?</p>
            <ul className="space-y-2">
              {["Como sair do imóvel", "Regras do contrato", "Vistorias e Danos", "Suporte 24h"].map((item) => (
                <li key={item}>
                  <Link href="#" className="flex items-center justify-between py-2 text-sm font-medium text-ink dark:text-white hover:text-primary group">
                    {item}
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tempo de Contrato */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-5">
            <h2 className="text-lg font-bold dark:text-white mb-3">Tempo de Contrato</h2>
            <p className="text-sm text-muted dark:text-gray-400">
              Você está há <strong className="text-primary">10 meses</strong> no imóvel de um contrato de 30 meses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
