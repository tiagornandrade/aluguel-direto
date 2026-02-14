"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contractsApi } from "@/lib/api-client";

type Props = {
  contractId: string;
  canSign: boolean; // current user is owner or tenant and has not signed yet
  role: "owner" | "tenant";
};

export function AssinarContratoButton({ contractId, canSign, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canSign) return null;

  async function handleSign() {
    setError(null);
    setLoading(true);
    try {
      await contractsApi.sign(contractId, role);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao assinar.");
    } finally {
      setLoading(false);
    }
  }

  const label = role === "owner" ? "Assinar como locador" : "Assinar como locatário";

  return (
    <div className="print:hidden mt-6">
      <button
        type="button"
        onClick={handleSign}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
      >
        <span className="material-symbols-outlined">draw</span>
        {loading ? "Assinando…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
