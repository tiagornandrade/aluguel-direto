"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notificationsApi } from "@/lib/api-client";

export function NotificacoesActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAllRead() {
    setLoading(true);
    try {
      await notificationsApi.markAllAsRead();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleMarkAllRead}
      disabled={loading}
      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/10 disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-lg">done_all</span>
      {loading ? "Salvando…" : "Marcar todas como lidas"}
    </button>
  );
}
