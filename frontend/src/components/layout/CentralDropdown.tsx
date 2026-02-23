"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { notificationsApi } from "@/lib/api-client";

type NotificationItem = {
  notification: {
    id: string;
    type: string;
    propertyId: string | null;
    contractId?: string | null;
    conversationId?: string | null;
    message: string | null;
    read: boolean;
    createdAt: string;
  };
  senderName: string;
  propertyTitle: string | null;
};

type GroupKey = "mensagens" | "interesses" | "solicitacoes_locatario" | "solicitacoes_locador" | "outros";

const GROUP_CONFIG: Record<GroupKey, { label: string; icon: string }> = {
  mensagens: { label: "Mensagens", icon: "chat_bubble" },
  interesses: { label: "Interesses no imóvel", icon: "person_add" },
  solicitacoes_locatario: { label: "Solicitações do locatário", icon: "mail" },
  solicitacoes_locador: { label: "Solicitações do locador", icon: "mail" },
  outros: { label: "Outros", icon: "notifications" },
};

function getGroupKey(type: string): GroupKey {
  if (type === "NOVA_MENSAGEM") return "mensagens";
  if (type === "CONTACT_REQUEST") return "interesses";
  if (["PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"].includes(type)) return "solicitacoes_locatario";
  if (type === "SOLICITACAO_LOCADOR_TROCA") return "solicitacoes_locador";
  return "outros";
}

function getItemHref(item: NotificationItem): string {
  const { notification } = item;
  if (notification.type === "NOVA_MENSAGEM" && notification.conversationId) return `/mensagens/${notification.conversationId}`;
  if (notification.type === "CONTACT_REQUEST") return `/perfil-interessado/${notification.id}`;
  if (["PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"].includes(notification.type) && notification.contractId) return `/contratos/${notification.contractId}`;
  if (notification.type === "SOLICITACAO_LOCADOR_TROCA" && notification.contractId) return `/contratos/${notification.contractId}`;
  return "/notificacoes";
}

function getItemLabel(item: NotificationItem): string {
  const { notification, senderName, propertyTitle } = item;
  if (notification.type === "NOVA_MENSAGEM") return `${senderName}${propertyTitle ? ` — ${propertyTitle}` : ""}`;
  if (notification.type === "CONTACT_REQUEST") return `${senderName}${propertyTitle ? ` — ${propertyTitle}` : ""}`;
  if (notification.type === "PEDIDO_REPARO") return `${senderName}: reparo`;
  if (notification.type === "PEDIDO_TROCA") return `${senderName}: troca`;
  if (notification.type === "PEDIDO_RESCISAO") return `${senderName}: rescisão`;
  if (notification.type === "SOLICITACAO_LOCADOR_TROCA") return `${senderName} — solicitação de troca`;
  return senderName;
}

export function CentralDropdown({ isInquilino }: { isInquilino: boolean }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [list, setList] = useState<NotificationItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(() => {
    notificationsApi
      .unreadCount()
      .then((data) => setUnreadCount(typeof data?.unreadCount === "number" ? data.unreadCount : 0))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    notificationsApi
      .list()
      .then((data) => {
        let items = data?.notifications ?? [];
        if (isInquilino) {
          items = items.filter(
            (n) => !["CONTACT_REQUEST", "PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"].includes(n.notification.type)
          );
        }
        setList(items);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [open, isInquilino]);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const grouped =
    list &&
    list.reduce<Record<GroupKey, NotificationItem[]>>(
      (acc, item) => {
        const key = getGroupKey(item.notification.type);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<GroupKey, NotificationItem[]>
    );
  const hasGroups = grouped && Object.keys(grouped).length > 0;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-medium text-muted dark:text-gray-400 hover:text-primary py-2"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Abrir Central"
      >
        <span className="material-symbols-outlined text-lg">support</span>
        Central
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-[300px] max-h-[min(80vh,400px)] overflow-auto rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 py-2"
          role="menu"
        >
          <div className="border-b border-[#dcdfe5] dark:border-slate-700 pb-2 mb-2">
            <Link
              href="/mensagens"
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              Mensagens
            </Link>
            {isInquilino && (
              <Link
                href="/solicitacoes"
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                <span className="material-symbols-outlined text-primary">send</span>
                Solicitações
              </Link>
            )}
            <Link
              href="/notificacoes"
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined text-primary">notifications</span>
              Notificações
              {unreadCount != null && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/documentos"
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined text-primary">description</span>
              Documentos
            </Link>
          </div>
          <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted dark:text-gray-500">
            Últimas notificações
          </div>
          {loading ? (
            <div className="px-3 py-4 text-center text-sm text-muted dark:text-gray-400">Carregando…</div>
          ) : !hasGroups ? (
            <div className="px-3 py-4 text-center text-sm text-muted dark:text-gray-400">Nenhuma notificação</div>
          ) : (
            <div className="py-1">
              {(Object.keys(GROUP_CONFIG) as GroupKey[]).map((key) => {
                const items = grouped?.[key];
                if (!items?.length) return null;
                const config = GROUP_CONFIG[key];
                return (
                  <div key={key} className="mb-2 last:mb-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted dark:text-gray-500">
                      <span className="material-symbols-outlined text-sm">{config.icon}</span>
                      {config.label}
                    </div>
                    <ul className="space-y-0.5">
                      {items.slice(0, 2).map((item) => (
                        <li key={item.notification.id}>
                          <Link
                            href={getItemHref(item)}
                            className="block px-3 py-1.5 text-sm text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 truncate"
                            onClick={() => setOpen(false)}
                          >
                            {!item.notification.read && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle" />
                            )}
                            {getItemLabel(item)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {items.length > 2 && (
                      <Link
                        href="/notificacoes"
                        className="block px-3 py-1 text-xs font-medium text-primary hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        Ver todas ({items.length})
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="pt-2 mt-2 border-t border-[#dcdfe5] dark:border-slate-700 px-3">
            <Link
              href="/notificacoes"
              className="block text-center text-sm font-medium text-primary hover:underline py-1"
              onClick={() => setOpen(false)}
            >
              Ver todas as notificações
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
