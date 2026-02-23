import Link from "next/link";
import type { NotificationItem } from "@/lib/backend-server";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function NotificationCard({ notification, senderName, propertyTitle }: NotificationItem) {
  const unread = !notification.read;

  return (
    <li
      className={`bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-4 ${
        unread ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="flex gap-3">
        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">mail</span>
        <div className="min-w-0 flex-1">
          {notification.type === "CONTACT_REQUEST" && (
            <>
              <p className="font-semibold text-ink dark:text-white">
                <span className="text-primary">{senderName}</span> tem interesse no imóvel
                {propertyTitle ? (
                  notification.propertyId ? (
                    <>
                      {" "}
                      <Link href={`/imoveis/${notification.propertyId}/editar`} className="text-primary hover:underline">
                        &quot;{propertyTitle}&quot;
                      </Link>
                    </>
                  ) : (
                    ` "${propertyTitle}"`
                  )
                ) : (
                  ""
                )}
              </p>
              {notification.message && (
                <p className="text-sm text-muted dark:text-gray-400 mt-1 whitespace-pre-wrap">{notification.message}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                <Link
                  href={`/perfil-interessado/${notification.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  Analisar perfil
                </Link>
                {notification.propertyId && (
                  <>
                    <Link
                      href={`/mensagens/nova?propertyId=${encodeURIComponent(notification.propertyId)}&otherParticipantId=${encodeURIComponent(notification.senderId)}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">chat_bubble</span>
                      Enviar mensagem
                    </Link>
                    <Link
                      href={`/contratos/novo?propertyId=${encodeURIComponent(notification.propertyId)}&tenantId=${encodeURIComponent(notification.senderId)}&tenantName=${encodeURIComponent(senderName)}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">play_circle</span>
                      Iniciar locação
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
          {(notification.type === "PEDIDO_REPARO" ||
            notification.type === "PEDIDO_TROCA" ||
            notification.type === "PEDIDO_RESCISAO") && (
            <>
              <p className="font-semibold text-ink dark:text-white">
                <span className="text-primary">{senderName}</span>
                {notification.type === "PEDIDO_REPARO" && " solicitou reparo/manutenção"}
                {notification.type === "PEDIDO_TROCA" && " solicitou troca de algo"}
                {notification.type === "PEDIDO_RESCISAO" && " solicitou rescisão do contrato"}
                {propertyTitle && <span> — {propertyTitle}</span>}
              </p>
              {notification.message && (
                <p className="text-sm text-muted dark:text-gray-400 mt-1 whitespace-pre-wrap">{notification.message}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {notification.contractId && (
                  <Link
                    href={`/contratos/${notification.contractId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    Ver contrato
                  </Link>
                )}
                {notification.propertyId && (
                  <Link
                    href={`/mensagens/nova?propertyId=${encodeURIComponent(notification.propertyId)}&otherParticipantId=${encodeURIComponent(notification.senderId)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                    Enviar mensagem
                  </Link>
                )}
              </div>
            </>
          )}
          {notification.type === "SOLICITACAO_LOCADOR_TROCA" && (
            <>
              <p className="font-semibold text-ink dark:text-white">
                <span className="text-primary">{senderName}</span> (locador) enviou uma solicitação de troca
                {propertyTitle && <span> — {propertyTitle}</span>}
              </p>
              {notification.message && (
                <p className="text-sm text-muted dark:text-gray-400 mt-1 whitespace-pre-wrap">{notification.message}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {notification.contractId && (
                  <Link
                    href={`/contratos/${notification.contractId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    Ver contrato
                  </Link>
                )}
                {notification.propertyId && (
                  <Link
                    href={`/mensagens/nova?propertyId=${encodeURIComponent(notification.propertyId)}&otherParticipantId=${encodeURIComponent(notification.senderId)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                    Enviar mensagem
                  </Link>
                )}
              </div>
            </>
          )}
          {notification.type === "NOVA_MENSAGEM" && (
            <>
              <p className="font-semibold text-ink dark:text-white">
                <span className="text-primary">{senderName}</span> enviou uma mensagem
                {propertyTitle && <span> — {propertyTitle}</span>}
              </p>
              {notification.message && (
                <p className="text-sm text-muted dark:text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {notification.conversationId && (
                  <Link
                    href={`/mensagens/${notification.conversationId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                    Ver conversa
                  </Link>
                )}
              </div>
            </>
          )}
          {!["CONTACT_REQUEST", "PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO", "SOLICITACAO_LOCADOR_TROCA", "NOVA_MENSAGEM"].includes(
            notification.type
          ) && (
            <p className="font-semibold text-ink dark:text-white">
              {senderName}
              {propertyTitle && ` — ${propertyTitle}`}
            </p>
          )}
          <p className="text-xs text-muted dark:text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
        </div>
      </div>
    </li>
  );
}
