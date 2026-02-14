"use client";

import { useState } from "react";
import { notificationsApi } from "@/lib/api-client";

export function EntrarEmContatoButton({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await notificationsApi.sendContactRequest({ propertyId, message: message.trim() || null });
      setSent(true);
      setOpen(false);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium">
        <span className="material-symbols-outlined text-lg">check_circle</span>
        Mensagem enviada! O proprietário será notificado na plataforma.
      </p>
    );
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
      >
        <span className="material-symbols-outlined text-xl">mail</span>
        Entrar em contato
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold dark:text-white mb-1">Enviar mensagem ao proprietário</h3>
            <p className="text-sm text-muted dark:text-gray-400 mb-4">{propertyTitle}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium dark:text-white">Mensagem (opcional)</span>
                <textarea
                  className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-base min-h-[100px] focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ex: Gostaria de agendar uma visita..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                />
              </label>
              {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#dcdfe5] dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? "Enviando…" : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
