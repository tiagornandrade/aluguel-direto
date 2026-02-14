"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { installmentsApi } from "@/lib/api-client";

export function MarkPaidButton({ installmentId }: { installmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkPaid() {
    setError(null);
    setLoading(true);
    try {
      await installmentsApi.markPaid(installmentId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao marcar como pago.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleMarkPaid}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Salvando…" : "Marcar como pago"}
        <span className="material-symbols-outlined text-lg">check_circle</span>
      </button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
