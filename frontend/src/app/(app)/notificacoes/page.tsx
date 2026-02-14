import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotificationsForUser } from "@/lib/backend-server";
import { NotificacoesActions } from "./NotificacoesActions";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function NotificacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { notifications, unreadCount } = await getNotificationsForUser();

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Notificações</h1>
          <p className="text-[#636f88] dark:text-gray-400">
            {unreadCount > 0 ? (
              <span>{unreadCount} {unreadCount === 1 ? "não lida" : "não lidas"}</span>
            ) : (
              "Mensagens e avisos enviados para você na plataforma."
            )}
          </p>
        </div>
        {unreadCount > 0 && <NotificacoesActions />}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">notifications_none</span>
          <p className="text-muted dark:text-gray-400">Nenhuma notificação no momento.</p>
          <p className="text-sm text-muted dark:text-gray-500 mt-1">
            Quando um inquilino enviar interesse em seu imóvel, aparecerá aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map(({ notification, senderName, propertyTitle }) => (
            <li
              key={notification.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-4 ${
                !notification.read ? "border-l-4 border-l-primary" : ""
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
                        <p className="text-sm text-muted dark:text-gray-400 mt-1 whitespace-pre-wrap">
                          {notification.message}
                        </p>
                      )}
                      {notification.propertyId && (
                        <Link
                          href={`/contratos/novo?propertyId=${encodeURIComponent(notification.propertyId)}&tenantId=${encodeURIComponent(notification.senderId)}&tenantName=${encodeURIComponent(senderName)}`}
                          className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-base">play_circle</span>
                          Iniciar locação
                        </Link>
                      )}
                    </>
                  )}
                  <p className="text-xs text-muted dark:text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
