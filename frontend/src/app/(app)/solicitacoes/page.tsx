import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSentRequests, type SentRequestItem } from "@/lib/backend-server";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const TYPE_LABELS: Record<string, string> = {
  CONTACT_REQUEST: "Interesse no imóvel",
  PEDIDO_REPARO: "Reparo / manutenção",
  PEDIDO_TROCA: "Troca de algo",
  PEDIDO_RESCISAO: "Rescisão do contrato",
};

function requestTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export default async function SolicitacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const {role} = session.user as { role?: string };
  if (role !== "INQUILINO") redirect(role === "PROPRIETARIO" ? "/dashboard-proprietario" : "/dashboard-inquilino");

  const requests = await getSentRequests();

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Solicitações</h1>
          <p className="text-muted dark:text-gray-400">
            Pedidos de interesse em imóveis e solicitações ao locador (reparo, troca, rescisão).
          </p>
        </div>
        <Link
          href="/solicitacoes/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shrink-0"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nova solicitação
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">pending_actions</span>
          <p className="text-muted dark:text-gray-400 font-medium">Nenhuma solicitação enviada</p>
          <p className="text-sm text-muted dark:text-gray-500 mt-1">
            Envie interesse em um imóvel (Buscar imóveis) ou crie uma solicitação ao locador (reparo, troca, rescisão) a partir de um contrato.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link href="/buscar-imoveis" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              <span className="material-symbols-outlined">search</span>
              Buscar imóveis
            </Link>
            <Link href="/solicitacoes/nova" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              <span className="material-symbols-outlined">add_circle</span>
              Nova solicitação
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((item: SentRequestItem) => (
            <li
              key={item.notification.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-4"
            >
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">mail</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted dark:text-gray-500 uppercase tracking-wide">
                    {requestTypeLabel(item.notification.type)}
                  </p>
                  <p className="font-semibold text-ink dark:text-white mt-0.5">
                    {item.notification.type === "CONTACT_REQUEST" ? (
                      <>
                        Interesse em{" "}
                        {item.notification.propertyId ? (
                          <Link href={`/buscar-imoveis/${item.notification.propertyId}`} className="text-primary hover:underline">
                            {item.propertyTitle ?? "Imóvel"}
                          </Link>
                        ) : (
                          <span>{item.propertyTitle ?? "Imóvel"}</span>
                        )}
                      </>
                    ) : (
                      <span>{item.propertyTitle ?? "Imóvel"}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted dark:text-gray-400 mt-0.5">Proprietário: {item.recipientName}</p>
                  {item.notification.message && (
                    <p className="text-sm text-muted dark:text-gray-500 mt-2 line-clamp-2">&quot;{item.notification.message}&quot;</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {item.notification.contractId && (
                      <Link
                        href={`/contratos/${item.notification.contractId}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-base">description</span>
                        Ver contrato
                      </Link>
                    )}
                    {item.notification.propertyId && (
                      <>
                        <Link
                          href={`/buscar-imoveis/${item.notification.propertyId}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-base">home</span>
                          Ver imóvel
                        </Link>
                        <Link
                          href={`/mensagens/nova?propertyId=${encodeURIComponent(item.notification.propertyId)}&otherParticipantId=${encodeURIComponent(item.notification.recipientId)}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-base">chat_bubble</span>
                          Enviar mensagem
                        </Link>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted dark:text-gray-500 mt-2">Enviado em {formatDate(item.notification.createdAt)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
