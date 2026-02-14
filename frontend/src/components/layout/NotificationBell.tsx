"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/api-client";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    notificationsApi
      .unreadCount()
      .then((data) => {
        if (!cancelled) setUnreadCount(data.unreadCount);
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/notificacoes"
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-muted dark:text-gray-400"
      title="Notificações"
      aria-label={unreadCount != null && unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"}
    >
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount != null && unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
