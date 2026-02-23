"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DocumentoVerPage() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId");
  const docId = searchParams.get("docId");
  const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");
  const [message, setMessage] = useState<string>("");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("documento.pdf");
  const [embedFailed, setEmbedFailed] = useState(false);
  const [pdfValidHeader, setPdfValidHeader] = useState<boolean | null>(null);
  const [contentKind, setContentKind] = useState<"pdf" | "image">("pdf");
  const blobUrlRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!contractId || !docId) {
      setStatus("error");
      setMessage("Parâmetros inválidos (contrato ou documento).");
      return;
    }
    setStatus("loading");
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setBlobUrl(null);
    try {
      const res = await fetch(
        `/api/proxy/contracts/${contractId}/documents/${docId}`,
        { credentials: "include" }
      );
      const contentType = res.headers.get("Content-Type") ?? "";
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) ?? disposition.match(/filename="?([^";\n]+)"?/i);
      if (match?.[1]) setFileName(decodeURIComponent(match[1].trim()));

      if (!res.ok) {
        const text = await res.text();
        if (contentType.includes("text/html") && text.includes("</")) {
          setMessage("Não foi possível abrir o documento. Verifique o link ou tente novamente.");
        } else {
          try {
            const data = JSON.parse(text) as { error?: string };
            setMessage(data.error ?? `Erro ${res.status}.`);
          } catch {
            setMessage(text.slice(0, 200) || `Erro ${res.status}.`);
          }
        }
        setStatus("error");
        return;
      }

      if (!contentType.includes("pdf") && !contentType.includes("octet-stream") && !contentType.startsWith("image/")) {
        setMessage("Tipo de arquivo não suportado para visualização.");
        setStatus("error");
        return;
      }

      const blob = await res.blob();
      const isImage = contentType.startsWith("image/");
      setContentKind(isImage ? "image" : "pdf");
      let showEmbed = true;
      if (isImage) {
        setPdfValidHeader(true);
      } else {
        const buf = await blob.slice(0, 5).arrayBuffer();
        const first = new TextDecoder().decode(buf);
        showEmbed = first === "%PDF-";
        setPdfValidHeader(showEmbed);
      }
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setBlobUrl(url);
      setEmbedFailed(!isImage && !showEmbed);
      setStatus("ok");
    } catch {
      setMessage("Não foi possível carregar o documento. Verifique sua conexão e se o servidor está rodando.");
      setStatus("error");
    }
  }, [contractId, docId]);

  useEffect(() => {
    void load();
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [load]);

  if (!contractId || !docId) {
    return (
      <div className="max-w-[500px] mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-ink dark:text-white mb-2">Documento</h1>
        <p className="text-muted dark:text-gray-400 mb-4">Link inválido. Use a página Documentos para abrir um arquivo.</p>
        <Link href="/documentos" className="text-primary hover:underline">Voltar para Documentos</Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="max-w-[500px] mx-auto px-4 py-12 text-center">
        <p className="text-muted dark:text-gray-400">Carregando documento…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-[500px] mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-ink dark:text-white mb-2">Não foi possível abrir o documento</h1>
        <p className="text-muted dark:text-gray-400 mb-4">{message}</p>
        <Link href="/documentos" className="text-primary hover:underline">Voltar para Documentos</Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <span className="text-sm font-medium text-ink dark:text-white truncate">{fileName}</span>
        <div className="flex items-center gap-2">
          {blobUrl && (
            <a
              href={blobUrl}
              download={fileName}
              className="text-sm text-primary hover:underline"
            >
              Baixar
            </a>
          )}
          <Link href="/documentos" className="text-sm text-primary hover:underline">
            Fechar
          </Link>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
        {blobUrl && (
          <>
            {embedFailed ? (
              <div className="max-w-md w-full rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                  {pdfValidHeader === false
                    ? "O arquivo não é um PDF válido ou está corrompido."
                    : "Não foi possível exibir o PDF no navegador."}
                </p>
                <p className="text-sm text-muted dark:text-gray-400 mb-4">Baixe e tente abrir no seu computador.</p>
                <a href={blobUrl} download={fileName} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">
                  Baixar documento
                </a>
              </div>
            ) : contentKind === "image" ? (
              <img src={blobUrl} alt={fileName} className="max-w-4xl max-h-[80vh] w-auto h-auto object-contain rounded border border-border dark:border-slate-700" />
            ) : (
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full max-w-4xl h-full min-h-[70vh] rounded border border-border dark:border-slate-700"
                title={fileName}
                onError={() => setEmbedFailed(true)}
              >
                <div className="max-w-md mx-auto rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
                  <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">Não foi possível exibir o PDF aqui.</p>
                  <p className="text-sm text-muted dark:text-gray-400 mb-4">Use o botão &quot;Baixar&quot; acima para abrir no seu computador.</p>
                  <a href={blobUrl} download={fileName} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">
                    Baixar documento
                  </a>
                </div>
              </object>
            )}
            <p className="text-xs text-muted dark:text-gray-500 mt-2">
              Se o documento não aparecer, use &quot;Baixar&quot; para abrir no seu computador.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
