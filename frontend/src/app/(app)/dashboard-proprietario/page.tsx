import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPropertiesForUser, getContractsForOwner, getInstallmentsForOwner, getNotificationsForUser, getOwnerPendingDocumentsCount } from "@/lib/backend-server";

function formatCurrency(val: number | null) {
  if (val == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function statusTag(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    ALUGADO: { label: "Alugado", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
    DISPONIVEL: { label: "Disponível", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
    EM_NEGOCIACAO: { label: "Em Negociação", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  };
  const t = map[status] ?? { label: status, className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${t.className}`}>{t.label}</span>;
}

export default async function DashboardProprietarioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = (session.user as { name?: string }).name ?? "Proprietário";

  let properties: Awaited<ReturnType<typeof getPropertiesForUser>> = [];
  let ownerContracts: Awaited<ReturnType<typeof getContractsForOwner>> = [];
  let installments: Awaited<ReturnType<typeof getInstallmentsForOwner>> = [];
  let notifications: Awaited<ReturnType<typeof getNotificationsForUser>>["notifications"] = [];
  let pendenciasDoc = 0;

  const cookie = (await headers()).get("cookie") ?? undefined;
  try {
    const [props, contracts, inst, notif, pendingDocCount] = await Promise.all([
      getPropertiesForUser(),
      getContractsForOwner(),
      getInstallmentsForOwner(),
      getNotificationsForUser(cookie),
      getOwnerPendingDocumentsCount(),
    ]);
    properties = props;
    ownerContracts = contracts;
    installments = inst;
    notifications = notif.notifications;
    pendenciasDoc = pendingDocCount;
  } catch (err) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
        <h1 className="text-3xl font-black dark:text-white mb-2">Dashboard do Proprietário</h1>
        <p className="text-[#636f88] dark:text-gray-400 mb-4">Bem-vindo de volta, {name}.</p>
        <div className="rounded-xl p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="font-semibold text-amber-800 dark:text-amber-200">Não foi possível carregar os dados.</p>
          <p className="text-sm text-amber-700 dark:text-amber-300/90 mt-1">
            Verifique se o backend está rodando (ex.: <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">npm run dev</code> na pasta backend) e se <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">NEXT_PUBLIC_API_URL</code> no <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">.env.local</code> aponta para a URL correta (ex.: http://localhost:4000).
          </p>
        </div>
      </div>
    );
  }

  const ativos = properties.length;
  const proximosReceb = installments
    .filter((i) => i.installment.status !== "PAGO")
    .reduce((s, i) => s + i.installment.amount, 0);

  const activeByProperty = new Map<string, { contractId: string; tenantName: string; rentAmount: number }>();
  for (const c of ownerContracts) {
    if (c.contract.status === "ATIVO") {
      activeByProperty.set(c.contract.propertyId, {
        contractId: c.contract.id,
        tenantName: c.tenant.fullName,
        rentAmount: c.contract.rentAmount + c.contract.chargesAmount,
      });
    }
  }

  const pendingOwnerSignature = ownerContracts.filter(
    (c) => c.contract.status === "PENDENTE_ASSINATURA" && !c.contract.ownerSignedAt
  );
  const contactRequests = notifications.filter((n) => n.notification.type === "CONTACT_REQUEST" && !n.notification.read);
  const tenantRequests = notifications.filter(
    (n) =>
      ["PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"].includes(n.notification.type) && !n.notification.read
  );

  function tenantRequestTypeLabel(type: string): string {
    switch (type) {
      case "PEDIDO_REPARO":
        return "reparo/manutenção";
      case "PEDIDO_TROCA":
        return "troca de algo";
      case "PEDIDO_RESCISAO":
        return "rescisão do contrato";
      default:
        return type;
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black dark:text-white">Dashboard do Proprietário</h1>
        <p className="text-[#636f88] dark:text-gray-400 mt-1">Bem-vindo de volta, {name}. Aqui está o resumo do seu portfólio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#dcdfe5] dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">apartment</span>
          </div>
          <div>
            <p className="text-[#636f88] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Imóveis Ativos</p>
            <p className="text-3xl font-bold dark:text-white mt-1">{ativos}</p>
          </div>
        </div>
        <Link href="/documentos" className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#dcdfe5] dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">description</span>
          </div>
          <div>
            <p className="text-[#636f88] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Pendências Documentais</p>
            <p className="text-3xl font-bold dark:text-white mt-1">{pendenciasDoc}</p>
            <p className="text-xs text-primary font-medium mt-1">Analisar documentação</p>
          </div>
        </Link>
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#dcdfe5] dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">payments</span>
          </div>
          <div>
            <p className="text-[#636f88] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Próximos Recebimentos</p>
            <p className="text-3xl font-bold dark:text-white mt-1">{formatCurrency(proximosReceb > 0 ? proximosReceb : 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-[#dcdfe5] dark:border-slate-700">
              <h2 className="text-xl font-bold dark:text-white">Meus Imóveis</h2>
              <Link href="/imoveis" className="text-primary text-sm font-semibold hover:underline">Ver todos</Link>
            </div>
            {properties.length === 0 ? (
              <div className="p-6">
                <p className="text-[#636f88] dark:text-gray-400 mb-4">Nenhum imóvel cadastrado.</p>
                <Link href="/imoveis/novo" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90">
                  Cadastrar imóvel
                  <span className="material-symbols-outlined text-lg">add</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-muted dark:text-gray-500 uppercase tracking-wider border-b border-[#dcdfe5] dark:border-slate-700">
                      <th className="p-4">Imóvel</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Locatário</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.slice(0, 5).map((p) => {
                      const active = activeByProperty.get(p.id);
                      return (
                        <tr key={p.id} className="border-b border-[#dcdfe5] dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-gray-500">apartment</span>
                              </div>
                              <span className="font-medium text-ink dark:text-white">{p.title}</span>
                            </div>
                          </td>
                          <td className="p-4">{statusTag(p.status)}</td>
                          <td className="p-4 text-muted dark:text-gray-400">{active?.tenantName ?? "—"}</td>
                          <td className="p-4 font-medium dark:text-white">{formatCurrency(active?.rentAmount ?? (p.rentAmount ?? p.chargesAmount))}</td>
                          <td className="p-4">
                            {active && (
                              <Link
                                href={`/solicitacoes/enviar-ao-locatario?contractId=${encodeURIComponent(active.contractId)}`}
                                className="text-sm font-medium text-primary hover:underline"
                                title="Enviar uma solicitação ou aviso para o locatário"
                              >
                                Enviar solicitação ao locatário
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold dark:text-white mb-4">Ações Prioritárias</h2>
          <div className="space-y-4">
            {pendingOwnerSignature.length > 0 && (
              <div className="p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">edit_document</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold dark:text-white">Contrato pendente</p>
                    <p className="text-sm text-muted dark:text-gray-400">
                      {pendingOwnerSignature[0].property.title} - Requer sua assinatura digital
                    </p>
                    <Link href={`/contratos/${pendingOwnerSignature[0].contract.id}`} className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
                      Assinar agora
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {contactRequests.length > 0 && (
              <div className="p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">person_add</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold dark:text-white">Nova Proposta</p>
                    <p className="text-sm text-muted dark:text-gray-400">
                      {contactRequests[0].propertyTitle ?? "Imóvel"} - Interessado: {contactRequests[0].senderName}
                    </p>
                    <Link href={`/perfil-interessado/${contactRequests[0].notification.id}`} className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
                      Analisar perfil
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {tenantRequests.length > 0 && (
              <div className="p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">mail</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold dark:text-white">Solicitação recebida do locatário</p>
                    <p className="text-sm text-muted dark:text-gray-400">
                      {tenantRequests[0].senderName} solicitou {tenantRequestTypeLabel(tenantRequests[0].notification.type)} — {tenantRequests[0].propertyTitle ?? "imóvel"}
                    </p>
                    <Link href="/notificacoes" className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
                      Ver em Notificações
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {pendingOwnerSignature.length === 0 && contactRequests.length === 0 && tenantRequests.length === 0 && (
              <div className="p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                <p className="text-muted dark:text-gray-400 text-sm">Nenhuma ação prioritária no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
