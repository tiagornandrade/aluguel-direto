"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { propertiesApi } from "@/lib/api-client";

export function ExcluirImovelButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleExcluir() {
    setLoading(true);
    try {
      await propertiesApi.delete(id);
      setConfirming(false);
      setLoading(false);
      router.refresh();
    } catch {
      setLoading(false);
      setConfirming(false);
      alert("Não foi possível excluir o imóvel. Tente novamente.");
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-[#636f88] dark:text-gray-400">Excluir?</span>
        <button
          type="button"
          onClick={handleExcluir}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Excluindo…" : "Sim"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
        >
          Não
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
      title={`Excluir "${title}"`}
    >
      <span className="material-symbols-outlined text-lg">delete</span>
      Excluir
    </button>
  );
}
