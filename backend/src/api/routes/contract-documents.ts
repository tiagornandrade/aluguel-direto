import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { prisma } from "../../lib/db";
import { getContractById } from "../../application/contract/get-contract-by-id";
import { PrismaContractRepository } from "../../infrastructure/persistence/PrismaContractRepository";
import { analyzeDocument } from "../../lib/analyze-document";

const DOCUMENT_TYPES = ["RG", "CPF", "COMPROVANTE_RENDA", "COMPROVANTE_ENDERECO"] as const;
const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

const contractRepo = PrismaContractRepository;

function requireInternalAuth(req: Request, res: Response): string | null {
  const key = req.headers["x-api-key"];
  const userId = req.headers["x-user-id"] as string | undefined;
  if (key !== env.INTERNAL_API_KEY || !userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return userId;
}

async function ensureContractAccess(
  userId: string,
  contractId: string,
  res: Response
): Promise<{ isOwner: boolean; isTenant: boolean } | null> {
  try {
    const detail = await getContractById(contractRepo, userId, contractId);
    const isOwner = detail.contract.ownerId === userId;
    const isTenant = detail.contract.tenantId === userId;
    return { isOwner, isTenant };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") res.status(404).json({ error: "NOT_FOUND" });
      else if (e.message === "FORBIDDEN") res.status(403).json({ error: "FORBIDDEN" });
    }
    return null;
  }
}

const uploadBody = z.object({
  type: z.enum(DOCUMENT_TYPES),
  fileName: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_CONTENT_TYPES as unknown as [string, ...string[]]).transform((t) =>
    t === "image/jpg" ? "image/jpeg" : t
  ),
  data: z.string().min(1), // base64
});

const reviewBody = z.object({
  status: z.enum(["APROVADO", "REJEITADO"]),
  rejectedReason: z.string().max(2000).optional().nullable(),
});

const contractDocumentsRouter = Router({ mergeParams: true });

type ParamsWithContractId = { id: string; docId?: string };

contractDocumentsRouter.get("/", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const contractId = (req.params as ParamsWithContractId).id;
  const access = await ensureContractAccess(userId, contractId, res);
  if (!access) return;

  const docs = await prisma.tenantDocument.findMany({
    where: { contractId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      contractId: true,
      tenantId: true,
      type: true,
      fileName: true,
      contentType: true,
      status: true,
      rejectedReason: true,
      reviewedAt: true,
      reviewedById: true,
      analysisResult: true,
      analyzedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json({ documents: docs });
});

contractDocumentsRouter.post("/", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const contractId = (req.params as ParamsWithContractId).id;
  const access = await ensureContractAccess(userId, contractId, res);
  if (!access) return;
  if (!access.isTenant) return res.status(403).json({ error: "Apenas o locatário pode enviar documentos." });

  try {
    const body = uploadBody.parse(req.body);
    const buffer = Buffer.from(body.data, "base64");
    if (buffer.length > MAX_DOCUMENT_BYTES)
      return res.status(400).json({ error: "Documento muito grande. Máximo 10 MB." });

    const contract = await prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) return res.status(404).json({ error: "NOT_FOUND" });
    if (contract.tenantId !== userId) return res.status(403).json({ error: "FORBIDDEN" });
    if (contract.status !== "PENDENTE_ASSINATURA" && contract.status !== "ATIVO")
      return res.status(400).json({ error: "Só é possível enviar documentos para contrato pendente ou ativo." });

    const doc = await prisma.tenantDocument.create({
      data: {
        contractId,
        tenantId: userId,
        type: body.type,
        fileName: body.fileName,
        contentType: body.contentType,
        data: buffer,
        status: "PENDENTE_ANALISE",
      },
      select: {
        id: true,
        type: true,
        fileName: true,
        contentType: true,
        status: true,
        createdAt: true,
      },
    });
    res.status(201).json({ document: doc });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error && e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    console.error("POST /contracts/:id/documents error:", e);
    return res.status(500).json({ error: "Erro ao enviar documento. Tente novamente." });
  }
});

contractDocumentsRouter.get("/:docId", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id: contractId, docId } = req.params as ParamsWithContractId & { docId: string };
  const access = await ensureContractAccess(userId, contractId, res);
  if (!access) return;

  const doc = await prisma.tenantDocument.findFirst({
    where: { id: docId, contractId },
  });
  if (!doc) return res.status(404).json({ error: "NOT_FOUND" });

  res.setHeader("Content-Type", doc.contentType);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(doc.fileName)}"`);
  res.setHeader("Cache-Control", "private, no-cache");
  res.send(doc.data);
});

contractDocumentsRouter.patch("/:docId/review", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id: contractId, docId } = req.params as ParamsWithContractId & { docId: string };
  const access = await ensureContractAccess(userId, contractId, res);
  if (!access) return;
  if (!access.isOwner) return res.status(403).json({ error: "Apenas o locador pode analisar documentos." });

  try {
    const body = reviewBody.parse(req.body);
    const doc = await prisma.tenantDocument.findFirst({
      where: { id: docId, contractId },
    });
    if (!doc) return res.status(404).json({ error: "NOT_FOUND" });

    const updated = await prisma.tenantDocument.update({
      where: { id: docId },
      data: {
        status: body.status,
        rejectedReason: body.status === "REJEITADO" ? (body.rejectedReason ?? null) : null,
        reviewedAt: new Date(),
        reviewedById: userId,
      },
      select: {
        id: true,
        type: true,
        fileName: true,
        status: true,
        rejectedReason: true,
        reviewedAt: true,
        reviewedById: true,
      },
    });
    res.json({ document: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    console.error("PATCH /contracts/:id/documents/:docId/review error:", e);
    return res.status(500).json({ error: "Erro ao atualizar análise. Tente novamente." });
  }
});

contractDocumentsRouter.post("/:docId/analyze", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id: contractId, docId } = req.params as ParamsWithContractId & { docId: string };
  const access = await ensureContractAccess(userId, contractId, res);
  if (!access) return;
  if (!access.isOwner) return res.status(403).json({ error: "Apenas o locador pode solicitar análise por IA." });

  try {
    const doc = await prisma.tenantDocument.findFirst({
      where: { id: docId, contractId },
    });
    if (!doc) return res.status(404).json({ error: "NOT_FOUND" });

    const buffer = Buffer.from(doc.data);
    const result = await analyzeDocument(buffer, doc.contentType, doc.type);

    await prisma.tenantDocument.update({
      where: { id: docId },
      data: {
        analysisResult: JSON.parse(JSON.stringify(result)),
        analyzedAt: new Date(),
      },
    });

    res.json({ analysis: result });
  } catch (e) {
    console.error("POST /contracts/:id/documents/:docId/analyze error:", e);
    const err = e as { status?: number; code?: string };
    if (err.status === 429 || err.code === "insufficient_quota" || err.code === "rate_limit_exceeded") {
      return res.status(429).json({
        error:
          "Cota da API de IA excedida. Verifique seu plano e cobrança na OpenAI ou tente mais tarde.",
      });
    }
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({
      error: "Erro ao analisar documento com IA. Tente novamente.",
      ...(process.env.NODE_ENV !== "production" && { detail: message }),
    });
  }
});

export { contractDocumentsRouter };
