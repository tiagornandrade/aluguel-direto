"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContractWithDetails } from "@/lib/backend-server";

const TYPES = [
  { value: "PEDIDO_REPARO", label: "Reparo / manutenção" },
  { value: "PEDIDO_TROCA", label: "Troca de algo" },
  { value: "PEDIDO_RESCISAO", label: "Rescisão do contrato" },
] as const;

export function NovaSolicitacaoForm({ contracts }: { contracts: ContractWithDetails[] }) {
  const [contractId, setContractId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("PEDIDO_REPARO");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!contractId.trim()) {
      setError("Escolha um contrato.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/notifications/tenant-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contractId: contractId.trim(),
          type,
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

  if (contracts.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
        <p className="text-amber-800 dark:text-amber-200 font-medium">Você não tem contratos ativos.</p>
        <p className="text-sm text-muted dark:text-gray-400 mt-1">Solicitações ao locador só podem ser enviadas para um contrato em andamento.</p>
        <Link href="/solicitacoes" className="inline-block mt-4 text-primary font-medium hover:underline">Voltar</Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <p className="text-green-800 dark:text-green-200 font-medium">Solicitação enviada.</p>
        <p className="text-sm text-muted dark:text-gray-400 mt-1">O proprietário será notificado e poderá responder pelas notificações ou mensagens.</p>
        <Link href="/solicitacoes" className="inline-block mt-4 text-primary font-medium hover:underline">Ver solicitações</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6 space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-ink dark:text-white mb-1">Contrato</span>
        <select
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          className="w-full rounded-lg border border-[#dcdfe5] dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-ink dark:text-white"
          required
        >
          <option value="">Selecione o contrato</option>
          {contracts.map((c) => (
            <option key={c.contract.id} value={c.contract.id}>
              {c.property.title} — {c.property.addressLine}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-ink dark:text-white mb-1">Tipo</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as (typeof TYPES)[number]["value"])}
          className="w-full rounded-lg border border-[#dcdfe5] dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-ink dark:text-white"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-ink dark:text-white mb-1">Mensagem (opcional)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva o que precisa..."
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-[#dcdfe5] dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-ink dark:text-white resize-none"
        />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Link
          href="/solicitacoes"
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
