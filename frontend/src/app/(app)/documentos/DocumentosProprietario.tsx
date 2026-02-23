"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContractForOwnerItem } from "@/lib/backend-server";
import {
  DOCUMENT_TYPE_LABELS,
  type TenantDocumentMeta,
} from "@/lib/backend-server";

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDENTE_ANALISE: "Pendente de análise",
    APROVADO: "Aprovado",
    REJEITADO: "Rejeitado",
  };
  return map[status] ?? status;
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    PENDENTE_ANALISE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    APROVADO: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    REJEITADO: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

export function DocumentosProprietario({
  contracts,
  documentsByContract,
}: {
  contracts: ContractForOwnerItem[];
  documentsByContract: Record<string, TenantDocumentMeta[]>;
}) {
  const router = useRouter();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const contractsWithDocs = contracts.filter((c) => {
    const docs = documentsByContract[c.contract.id] ?? [];
    return docs.length > 0;
  });

  async function handleAnalyze(contractId: string, docId: string) {
    setError(null);
    setAnalyzing(docId);
    try {
      const res = await fetch(`/api/proxy/contracts/${contractId}/documents/${docId}/analyze`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data.error as string) ?? "Erro ao analisar com IA.");
        return;
      }
      router.refresh();
    } finally {
      setAnalyzing(null);
    }
  }

  async function handleReview(
    contractId: string,
    docId: string,
    status: "APROVADO" | "REJEITADO"
  ) {
    setError(null);
    setReviewing(docId);
    try {
      const res = await fetch(`/api/proxy/contracts/${contractId}/documents/${docId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status,
          rejectedReason: status === "REJEITADO" ? (rejectReason[docId] ?? null) : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data.error as string) ?? "Erro ao atualizar análise.");
        return;
      }
      setRejectReason((prev) => ({ ...prev, [docId]: "" }));
      router.refresh();
    } finally {
      setReviewing(null);
    }
  }

  if (contractsWithDocs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-muted mb-4 block">folder_open</span>
        <p className="text-muted dark:text-gray-400 font-medium">Nenhum documento para analisar</p>
        <p className="text-sm text-muted dark:text-gray-500 mt-1">
          Quando os locatários enviarem documentos dos contratos, eles aparecerão aqui para sua análise e aprovação.
        </p>
      </div>
    );
  }

  const dicasPorTipo: Record<string, string[]> = {
    RG: ["Documento de identidade legível?", "Foto e dados conferem com o perfil do locatário?", "Data de validade (se houver) em dia?"],
    CPF: ["Número do CPF legível?", "Nome conferindo com os demais documentos?"],
    COMPROVANTE_RENDA: ["Renda compatível com o valor do aluguel?", "Período e empregador identificados?"],
    COMPROVANTE_ENDERECO: ["Endereço atual e legível?", "Data do comprovante recente?"],
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-blue-50/80 dark:bg-slate-800/50 p-4">
        <h3 className="text-sm font-semibold text-ink dark:text-white flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-lg text-primary">lightbulb</span>
          Apoio à análise
        </h3>
        <p className="text-sm text-muted dark:text-gray-600 dark:text-gray-400">
          Use o link do documento para abrir e conferir. Você pode usar <strong>Analisar com IA</strong> para obter um resumo e validação automática (legibilidade, conformidade com o tipo). A decisão final continua sendo sua.
        </p>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      {contractsWithDocs.map((item) => {
        const docs = documentsByContract[item.contract.id] ?? [];
        const pending = docs.filter((d) => d.status === "PENDENTE_ANALISE");
        return (
          <div
            key={item.contract.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden"
          >
            <div className="p-4 border-b border-[#dcdfe5] dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold dark:text-white">{item.property.title}</h2>
                <p className="text-sm text-muted dark:text-gray-400">
                  Locatário: {item.tenant.fullName}
                </p>
              </div>
              {pending.length > 0 && (
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {pending.length} pendente{pending.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-muted dark:text-gray-500 uppercase tracking-wider border-b border-[#dcdfe5] dark:border-slate-700">
                    <th className="p-4">Documento</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-[#dcdfe5] dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-4">
                        <a
                          href={`/documentos/ver?contractId=${encodeURIComponent(item.contract.id)}&docId=${encodeURIComponent(d.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {d.fileName}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className="text-muted dark:text-gray-400">
                          {DOCUMENT_TYPE_LABELS[d.type as keyof typeof DOCUMENT_TYPE_LABELS] ?? d.type}
                        </span>
                        {d.status === "PENDENTE_ANALISE" && dicasPorTipo[d.type] && (
                          <ul className="mt-2 text-xs text-muted dark:text-gray-500 space-y-0.5">
                            {dicasPorTipo[d.type].map((dica, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">•</span>
                                {dica}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(d.status)}`}>
                          {statusLabel(d.status)}
                        </span>
                        {d.rejectedReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{d.rejectedReason}</p>
                        )}
                        {d.analysisResult && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Análise por IA</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{d.analysisResult.summary}</p>
                            <ul className="mt-1 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                              <li>Legível: {d.analysisResult.checklist.documento_legivel ? "Sim" : "Não"}</li>
                              <li>Dados conferem com o tipo: {d.analysisResult.checklist.dados_conferem_tipo ? "Sim" : "Não"}</li>
                              {d.analysisResult.checklist.observacoes && (
                                <li>Obs.: {d.analysisResult.checklist.observacoes}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {d.status === "PENDENTE_ANALISE" ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAnalyze(item.contract.id, d.id)}
                              disabled={analyzing === d.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                            >
                              {analyzing === d.id ? "Analisando…" : "Analisar com IA"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(item.contract.id, d.id, "APROVADO")}
                              disabled={reviewing === d.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              Aprovar
                            </button>
                            <div className="flex flex-wrap items-center gap-1">
                              <input
                                type="text"
                                placeholder="Motivo da rejeição (opcional)"
                                value={rejectReason[d.id] ?? ""}
                                onChange={(e) =>
                                  setRejectReason((prev) => ({ ...prev, [d.id]: e.target.value }))
                                }
                                className="rounded border border-[#dcdfe5] dark:border-slate-600 bg-white dark:bg-slate-800 text-ink dark:text-white px-2 py-1 text-sm w-48"
                              />
                              <button
                                type="button"
                                onClick={() => handleReview(item.contract.id, d.id, "REJEITADO")}
                                disabled={reviewing === d.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                              >
                                Rejeitar
                              </button>
                            </div>
                            {reviewing === d.id && (
                              <span className="text-xs text-muted">Salvando...</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted dark:text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
