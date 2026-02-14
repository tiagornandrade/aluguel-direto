import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getInstallmentsForTenant, getInstallmentsForOwner } from "@/lib/backend-server";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(dateStr));
}

function statusLabel(status: string): string {
  if (status === "PAGO") return "Pago";
  if (status === "ATRASADO") return "Atrasado";
  return "Pendente";
}

function statusColor(status: string): string {
  if (status === "PAGO") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (status === "ATRASADO") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
}

export default async function PagamentosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const {role} = session.user as { role?: string };
  const isOwner = role === "PROPRIETARIO";
  const installments = isOwner ? await getInstallmentsForOwner() : await getInstallmentsForTenant();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-black dark:text-white mb-2">Pagamentos</h1>
      <p className="text-muted dark:text-gray-400 mb-6">
        {isOwner ? "Parcelas de aluguel dos seus contratos. Marque como pago quando receber." : "Suas parcelas de aluguel. Pague até o vencimento."}
      </p>

      {installments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">payments</span>
          <p className="text-muted dark:text-gray-400">
            {isOwner ? "Nenhuma parcela ainda. Os contratos ativos geram parcelas automaticamente." : "Nenhuma parcela. Quando você tiver um contrato ativo, as parcelas aparecerão aqui."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {installments.map((item) => (
            <Link
              key={item.installment.id}
              href={`/pagamentos/${item.installment.id}`}
              className="block bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-5 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold dark:text-white">{item.property.title}</p>
                  <p className="text-sm text-muted dark:text-gray-400">{item.property.addressLine}</p>
                  <p className="text-xs text-muted dark:text-gray-500 mt-1">
                    Referência: {String(item.installment.referenceMonth).padStart(2, "0")}/{item.installment.referenceYear}
                    {item.tenant && ` · ${item.tenant.fullName}`}
                    {item.owner && ` · Locador: ${item.owner.fullName}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold dark:text-white">{formatCurrency(item.installment.amount)}</span>
                  <span className="text-sm text-muted dark:text-gray-400">Venc.: {formatDate(item.installment.dueDate)}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(item.installment.status)}`}>
                    {statusLabel(item.installment.status)}
                  </span>
                  <span className="material-symbols-outlined text-muted">chevron_right</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
