"use client";

import { useState } from "react";
import { sendMessage } from "../actions";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await sendMessage(conversationId, text);
      if (result.ok) setContent("");
      else setError(result.error ?? "Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-3 rounded-lg border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900 text-ink dark:text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
          maxLength={10000}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">send</span>
          Enviar
        </button>
      </form>
    </div>
  );
}
