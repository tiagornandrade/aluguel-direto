import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContractsForOwner, getContractsForTenant } from "@/lib/backend-server";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE_ASSINATURA: "Pendente de assinatura",
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
};

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "ATIVO"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : status === "PENDENTE_ASSINATURA"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default async function ContratosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const {role} = session.user as { role?: string };
  const asOwner = role === "PROPRIETARIO" ? await getContractsForOwner() : [];
  const asTenant = role === "INQUILINO" ? await getContractsForTenant() : [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-black dark:text-white">Contratos</h1>
        {role === "PROPRIETARIO" && (
          <Link
            href="/contratos/novo"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Iniciar locação
          </Link>
        )}
      </div>

      {role === "PROPRIETARIO" && (
        <>
          <h2 className="text-xl font-bold text-ink dark:text-white mb-3">Como proprietário</h2>
          {asOwner.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6 mb-8">
              <p className="text-[#636f88] dark:text-gray-400">Nenhum contrato. Use &quot;Iniciar locação&quot; após um inquilino demonstrar interesse (notificações).</p>
            </div>
          ) : (
            <ul className="space-y-3 mb-8">
              {asOwner.map(({ contract, property, tenant }) => (
                <li key={contract.id} className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-4">
                  <Link href={`/contratos/${contract.id}`} className="block hover:opacity-90">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink dark:text-white">{property.title}</span>
                      <span className="text-muted dark:text-gray-400">–</span>
                      <span className="text-muted dark:text-gray-400">{property.addressLine}</span>
                      <span className="material-symbols-outlined text-muted text-lg ml-1">arrow_forward</span>
                    </div>
                    <p className="text-sm text-muted dark:text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={contract.status} />
                      Inquilino: <span className="font-medium text-ink dark:text-white">{tenant.fullName}</span>
                      {" · "}
                      {formatDate(contract.startDate)} a {formatDate(contract.endDate)}
                      {" · "}
                      R$ {contract.rentAmount.toFixed(2)}/mês
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {role === "INQUILINO" && (
        <>
          <h2 className="text-xl font-bold text-ink dark:text-white mb-3">Meus contratos</h2>
          {asTenant.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6">
              <p className="text-[#636f88] dark:text-gray-400">Nenhum contrato. Seus aluguéis aparecerão aqui e no dashboard.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {asTenant.map((c) => (
                <li key={c.contract.id} className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-4">
                  <Link href={`/contratos/${c.contract.id}`} className="block hover:opacity-90">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink dark:text-white">{c.property.title}</span>
                      <span className="text-muted dark:text-gray-400">–</span>
                      <span className="text-muted dark:text-gray-400">{c.property.addressLine}</span>
                      <span className="material-symbols-outlined text-muted text-lg ml-1">arrow_forward</span>
                    </div>
                    <p className="text-sm text-muted dark:text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={c.contract.status} />
                      {formatDate(c.contract.startDate)} a {formatDate(c.contract.endDate)}
                      {" · "}
                      R$ {c.contract.rentAmount.toFixed(2)}/mês
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
