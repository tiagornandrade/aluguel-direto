import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getContractsForTenant } from "@/lib/backend-server";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getNextDueDate(dueDay: number): Date {
  const today = new Date();
  const day = Math.min(Math.max(1, dueDay), 28);
  const next = new Date(today.getFullYear(), today.getMonth(), day);
  if (next <= today) next.setMonth(next.getMonth() + 1);
  return next;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getContractMonths(startDate: Date, endDate: Date): { elapsed: number; total: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const total = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const elapsed = now < start ? 0 : Math.min((now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()), total);
  return { elapsed, total };
}

export default async function DashboardInquilinoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = (session.user as { name?: string }).name ?? "Inquilino";
  const contracts = await getContractsForTenant();
  const active = contracts.find((c) => c.contract.status === "ATIVO"); // primeiro contrato ativo

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink dark:text-white">Olá, {name}</h1>
        <p className="mt-2 text-[#636f88] dark:text-gray-400">
          {active ? "Bem-vindo ao seu dashboard de aluguel. Tudo parece em ordem." : "Bem-vindo! Você ainda não possui um contrato ativo."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Próximo Aluguel */}
          {active ? (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-48 h-40 sm:h-auto sm:min-h-[180px] bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-gray-400">apartment</span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-gray-500">Próximo Aluguel</p>
                    <p className="text-2xl font-bold dark:text-white mt-1">
                      {formatCurrency(active.contract.rentAmount + active.contract.chargesAmount)}
                    </p>
                    <p className="text-sm text-muted dark:text-gray-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">event</span>
                      Vencimento em {formatDate(getNextDueDate(active.contract.dueDay))}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                      Copiar Pix/Boleto
                    </button>
                    <Link
                      href="/pagamentos"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
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
                        <p className="font-medium dark:text-white">{active.property.title}</p>
                        <p className="text-sm text-muted dark:text-gray-400">{active.property.addressLine}</p>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.property.addressLine)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-lg">map</span>
                      Mapa
                    </a>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0">
                      <span className="material-symbols-outlined text-muted shrink-0">person</span>
                      <div>
                        <p className="font-medium dark:text-white">Proprietário: {active.owner.fullName}</p>
                        <p className="text-sm text-muted dark:text-gray-400">
                          Contrato iniciado em {formatDate(new Date(active.contract.startDate))}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/contratos"
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-lg">description</span>
                      Ver Contrato
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-muted mb-4 block">apartment</span>
              <h2 className="text-lg font-bold dark:text-white mb-2">Nenhum contrato ativo</h2>
              <p className="text-sm text-muted dark:text-gray-400 mb-4">
                Quando você assinar um contrato de locação, as informações do imóvel e dos pagamentos aparecerão aqui.
              </p>
              <Link
                href="/buscar-imoveis"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                Buscar imóveis
                <span className="material-symbols-outlined text-lg">search</span>
              </Link>
            </div>
          )}

        </div>

        <div className="space-y-6">
          {/* Tempo de Contrato */}
          {active && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-5">
              <h2 className="text-lg font-bold dark:text-white mb-3">Tempo de Contrato</h2>
              {(() => {
                const { elapsed, total } = getContractMonths(
                  new Date(active.contract.startDate),
                  new Date(active.contract.endDate)
                );
                return (
                  <p className="text-sm text-muted dark:text-gray-400">
                    Você está há <strong className="text-primary">{elapsed} meses</strong> no imóvel de um contrato de{" "}
                    {total} meses.
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
