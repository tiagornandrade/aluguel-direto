import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

function htmlError(status: number, message: string): NextResponse {
  const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Erro</title><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0}.box{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem;text-align:center;max-width:400px}.box h1{font-size:1.25rem;margin:0 0 0.5rem}.box p{color:#94a3b8;margin:0 0 1.5rem}.box a{color:#38bdf8;text-decoration:none}.box a:hover{text-decoration:underline}</style></head><body><div class="box"><h1>Não foi possível abrir o documento</h1><p>${escapeHtml(message)}</p><a href="javascript:window.close()">Fechar aba</a></div></body></html>`;
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!INTERNAL_KEY) return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  const { id, docId } = await params;
  let res: Response;
  try {
    res = await fetch(`${BACKEND}/api/v1/contracts/${id}/documents/${docId}`, {
      headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
      cache: "no-store",
    });
  } catch {
    return htmlError(503, "Não foi possível abrir o documento. Verifique se o servidor está rodando.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data as { error?: string })?.error ?? "Documento não encontrado.";
    return htmlError(res.status, message);
  }
  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";
  const contentDisposition = res.headers.get("Content-Disposition") ?? "";
  const blob = await res.blob();
  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
