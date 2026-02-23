import Link from "next/link";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotificationsForUser, type NotificationItem } from "@/lib/backend-server";
import { NotificacoesActions } from "./NotificacoesActions";
import { NotificationCard } from "./NotificationCard";

type GroupKey = "mensagens" | "interesses" | "solicitacoes_locatario" | "solicitacoes_locador" | "outros";

const GROUP_ORDER: GroupKey[] = ["mensagens", "interesses", "solicitacoes_locatario", "solicitacoes_locador", "outros"];
const GROUP_LABELS: Record<GroupKey, string> = {
  mensagens: "Mensagens",
  interesses: "Interesses no imóvel",
  solicitacoes_locatario: "Solicitações do locatário",
  solicitacoes_locador: "Solicitações do locador",
  outros: "Outros",
};
const GROUP_ICONS: Record<GroupKey, string> = {
  mensagens: "chat_bubble",
  interesses: "person_add",
  solicitacoes_locatario: "mail",
  solicitacoes_locador: "mail",
  outros: "notifications",
};

function getGroupKey(type: string): GroupKey {
  if (type === "NOVA_MENSAGEM") return "mensagens";
  if (type === "CONTACT_REQUEST") return "interesses";
  if (["PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"].includes(type)) return "solicitacoes_locatario";
  if (type === "SOLICITACAO_LOCADOR_TROCA") return "solicitacoes_locador";
  return "outros";
}

function groupNotifications(notifications: NotificationItem[]): Record<GroupKey, NotificationItem[]> {
  const groups = GROUP_ORDER.reduce((acc, key) => ({ ...acc, [key]: [] as NotificationItem[] }), {} as Record<GroupKey, NotificationItem[]>);
  for (const item of notifications) {
    const key = getGroupKey(item.notification.type);
    groups[key].push(item);
  }
  return groups;
}

export default async function NotificacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { role } = session.user as { role?: string };
  const isInquilino = role === "INQUILINO";
  const cookie = (await headers()).get("cookie") ?? undefined;
  const { notifications: rawNotifications, unreadCount } = await getNotificationsForUser(cookie);
  const notifications = isInquilino
    ? rawNotifications.filter(
        (n) =>
          !["CONTACT_REQUEST", "PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"].includes(
            n.notification.type
          )
      )
    : rawNotifications;
  const unreadCountFiltered = notifications.filter((n) => !n.notification.read).length;

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Notificações</h1>
          <p className="text-[#636f88] dark:text-gray-400">
            {unreadCountFiltered > 0 ? (
              <span>{unreadCountFiltered} {unreadCountFiltered === 1 ? "não lida" : "não lidas"}</span>
            ) : (
              "Mensagens e avisos enviados para você na plataforma."
            )}
          </p>
        </div>
        {unreadCountFiltered > 0 && <NotificacoesActions />}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">notifications_none</span>
          <p className="text-muted dark:text-gray-400">Nenhuma notificação no momento.</p>
          <p className="text-sm text-muted dark:text-gray-500 mt-1">
            {isInquilino
              ? "Quando o locador enviar uma solicitação, aviso ou nova mensagem, aparecerá aqui."
              : "Quando um inquilino enviar interesse, solicitação ou nova mensagem, aparecerá aqui."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUP_ORDER.map((groupKey) => {
            const items = groupNotifications(notifications)[groupKey];
            if (!items.length) return null;
            return (
              <section key={groupKey}>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted dark:text-gray-500 mb-3">
                  <span className="material-symbols-outlined text-lg">{GROUP_ICONS[groupKey]}</span>
                  {GROUP_LABELS[groupKey]} ({items.length})
                </h2>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <NotificationCard
                      key={item.notification.id}
                      notification={item.notification}
                      senderName={item.senderName}
                      propertyTitle={item.propertyTitle}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
