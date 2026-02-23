"use client";

import { useState } from "react";
import Link from "next/link";

export function EnviarAoLocatarioForm({ contractId }: { contractId: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/notifications/owner-to-tenant-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contractId,
          message: message.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Erro ao enviar. Tente novamente.");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <p className="text-green-800 dark:text-green-200 font-medium">Solicitação enviada.</p>
        <p className="text-sm text-muted dark:text-gray-400 mt-1">O locatário verá na página de Notificações.</p>
        <div className="flex gap-3 justify-center mt-4">
          <Link href="/dashboard-proprietario" className="text-primary font-medium hover:underline">Dashboard</Link>
          <Link href="/notificacoes" className="text-primary font-medium hover:underline">Notificações</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6 space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-ink dark:text-white mb-1">Mensagem (opcional)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva o que deseja solicitar ao locatário (ex.: troca de titularidade, alteração de dados)..."
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-[#dcdfe5] dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-ink dark:text-white resize-none"
        />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Link
          href="/dashboard-proprietario"
          className="px-4 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-slate-600 font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Enviar solicitação"}
        </button>
      </div>
    </form>
  );
}
