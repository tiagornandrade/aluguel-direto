import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getConversations, getContractsForOwner, getContractsForTenant } from "@/lib/backend-server";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function otherParticipantName(item: { owner: { id: string; fullName: string }; otherParticipant: { id: string; fullName: string } }, currentUserId: string) {
  return item.owner.id === currentUserId ? item.otherParticipant.fullName : item.owner.fullName;
}

export default async function MensagensPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id as string;
  const {role} = session.user as { role?: string };
  const isOwner = role === "PROPRIETARIO";

  const conversations = await getConversations();
  const ownerContracts = isOwner ? await getContractsForOwner() : [];
  const tenantContracts = isOwner ? [] : await getContractsForTenant();
  const contracts = isOwner ? ownerContracts : tenantContracts;

  const activeContracts = contracts.filter(
    (c: { contract: { status: string } }) => c.contract.status === "ATIVO" || c.contract.status === "PENDENTE_ASSINATURA"
  );
  const conversationPropertyIds = new Set(conversations.map((c) => c.conversation.propertyId));

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Mensagens</h1>
      <p className="text-muted dark:text-gray-400 mb-6">
        Conversas relacionadas aos seus imóveis e contratos.
      </p>

      {activeContracts.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-ink dark:text-white mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_comment</span>
            Iniciar nova conversa
          </h2>
          <p className="text-sm text-muted dark:text-gray-500 mb-3">
            Selecione um contrato para abrir ou iniciar a conversa com o {isOwner ? "locatário" : "proprietário"}.
          </p>
          <ul className="space-y-2">
            {activeContracts.map((c) => {
              const otherId = isOwner ? (c as { tenant: { id: string } }).tenant.id : userId;
              const otherName = isOwner ? (c as { tenant: { fullName: string } }).tenant.fullName : (c as { owner: { fullName: string } }).owner.fullName;
              const alreadyHasConversation = conversationPropertyIds.has(c.contract.propertyId);
              return (
                <li key={c.contract.propertyId}>
                  <Link
                    href={`/mensagens/nova?propertyId=${encodeURIComponent(c.property.id)}&otherParticipantId=${encodeURIComponent(otherId)}`}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-[#dcdfe5] dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-ink dark:text-white">{c.property.title}</span>
                    <span className="text-sm text-muted dark:text-gray-400">{otherName}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {alreadyHasConversation ? "Abrir conversa" : "Conversar"}
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">chat_bubble_outline</span>
          <p className="text-muted dark:text-gray-400">Nenhuma conversa ainda.</p>
          <p className="text-sm text-muted dark:text-gray-500 mt-1">
            Use &quot;Iniciar nova conversa&quot; acima ou quando um interessado enviar mensagem pela notificação, aparecerá aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((item) => (
            <li key={item.conversation.id}>
              <Link
                href={`/mensagens/${item.conversation.id}`}
                className="flex gap-4 p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink dark:text-white">
                    {otherParticipantName(item, userId)}
                  </p>
                  <p className="text-sm text-muted dark:text-gray-500 truncate">
                    {item.property.title}
                  </p>
                  {item.lastMessage && (
                    <p className="text-sm text-muted dark:text-gray-400 mt-1 truncate">
                      {item.lastMessage.content}
                    </p>
                  )}
                </div>
                {item.lastMessage && (
                  <span className="text-xs text-muted dark:text-gray-500 shrink-0">
                    {formatDate(item.lastMessage.createdAt)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
