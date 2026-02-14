"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contractsApi } from "@/lib/api-client";

type Props = {
  contractId: string;
};

export function EncerrarContratoButton({ contractId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function handleEnd() {
    setError(null);
    setLoading(true);
    try {
      await contractsApi.end(contractId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao encerrar contrato.");
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (!confirm) {
    return (
      <div className="print:hidden mt-6">
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <span className="material-symbols-outlined">block</span>
          Encerrar contrato
        </button>
      </div>
    );
  }

  return (
    <div className="print:hidden mt-6 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-3">
        O imóvel voltará a ficar disponível para locação. Deseja realmente encerrar este contrato?
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleEnd}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Encerrando…" : "Sim, encerrar"}
        </button>
        <button
          type="button"
          onClick={() => { setConfirm(false); setError(null); }}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
