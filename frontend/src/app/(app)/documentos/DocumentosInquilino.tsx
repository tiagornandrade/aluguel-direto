"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContractWithDetails } from "@/lib/backend-server";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type TenantDocumentMeta,
} from "@/lib/backend-server";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

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

function getLatestDocByType(docs: TenantDocumentMeta[]): Record<string, TenantDocumentMeta> {
  const byType: Record<string, TenantDocumentMeta> = {};
  const sorted = [...docs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  for (const d of sorted) {
    if (!byType[d.type]) byType[d.type] = d;
  }
  return byType;
}

export function DocumentosInquilino({
  contracts,
  documentsByContract,
}: {
  contracts: ContractWithDetails[];
  documentsByContract: Record<string, TenantDocumentMeta[]>;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contractsForDocs = contracts.filter(
    (c) => c.contract.status === "PENDENTE_ASSINATURA" || c.contract.status === "ATIVO"
  );

  async function handleUpload(contractId: string, docType: string, file: File) {
    if (!file || file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo deve ter no máximo ${MAX_SIZE_MB} MB.`);
      return;
    }
    const contentType = file.type === "image/jpg" ? "image/jpeg" : file.type;
    if (!ALLOWED_TYPES.includes(contentType)) {
      setError("Use PDF ou imagem (JPEG, PNG, WebP).");
      return;
    }
    setError(null);
    setUploading(`${contractId}-${docType}`);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64 ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`/api/proxy/contracts/${contractId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: docType,
          fileName: file.name,
          contentType,
          data: base64,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data.error as string) ?? "Erro ao enviar documento.");
        return;
      }
      router.refresh();
    } finally {
      setUploading(null);
    }
  }

  if (contractsForDocs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-muted mb-4 block">description</span>
        <p className="text-muted dark:text-gray-400 font-medium">Nenhum contrato para enviar documentos</p>
        <p className="text-sm text-muted dark:text-gray-500 mt-1">
          Quando você tiver um contrato pendente ou ativo, poderá enviar RG, CPF, comprovante de renda e endereço aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      {contractsForDocs.map((item) => {
        const docs = documentsByContract[item.contract.id] ?? [];
        const latestByType = getLatestDocByType(docs);
        return (
          <div
            key={item.contract.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden"
          >
            <div className="p-4 border-b border-[#dcdfe5] dark:border-slate-700">
              <h2 className="text-lg font-bold dark:text-white">{item.property.title}</h2>
              <p className="text-sm text-muted dark:text-gray-400">{item.property.addressLine}</p>
              <p className="text-xs text-muted dark:text-gray-500 mt-1">
                Contrato {item.contract.status === "PENDENTE_ASSINATURA" ? "pendente de assinatura" : "ativo"}
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-ink dark:text-white mb-3">Documentos obrigatórios</h3>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {DOCUMENT_TYPES.map((docType) => {
                  const latest = latestByType[docType];
                  const uploadKey = `${item.contract.id}-${docType}`;
                  const isUploading = uploading === uploadKey;
                  return (
                    <div
                      key={docType}
                      className="rounded-lg border border-[#dcdfe5] dark:border-slate-700 p-4 bg-gray-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-medium text-ink dark:text-white">
                          {DOCUMENT_TYPE_LABELS[docType]}
                        </span>
                        {latest && (
                          <span
                            className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(latest.status)}`}
                          >
                            {statusLabel(latest.status)}
                          </span>
                        )}
                      </div>
                      {latest ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted dark:text-gray-400 truncate" title={latest.fileName}>
                            {latest.fileName}
                          </p>
                          {latest.rejectedReason && (
                            <p className="text-xs text-red-600 dark:text-red-400">Motivo: {latest.rejectedReason}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/documentos/ver?contractId=${encodeURIComponent(item.contract.id)}&docId=${encodeURIComponent(latest.id)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Ver documento
                            </a>
                            <label className="text-sm font-medium text-primary hover:underline cursor-pointer">
                              Reenviar
                              <input
                                type="file"
                                accept=".pdf,image/jpeg,image/png,image/webp"
                                className="sr-only"
                                disabled={!!uploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpload(item.contract.id, docType, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm text-muted dark:text-gray-500 mb-2">
                            PDF ou imagem (até {MAX_SIZE_MB} MB)
                          </label>
                          <input
                            type="file"
                            accept=".pdf,image/jpeg,image/png,image/webp"
                            className="block w-full text-sm text-muted dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-semibold file:cursor-pointer"
                            disabled={!!uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(item.contract.id, docType, file);
                              e.target.value = "";
                            }}
                          />
                          {isUploading && (
                            <p className="text-xs text-muted dark:text-gray-500 mt-1">Enviando...</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
