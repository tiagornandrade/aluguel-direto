import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { listContractsByTenant } from "../../application/contract/list-contracts-by-tenant";
import { listContractsByOwner } from "../../application/contract/list-contracts-by-owner";
import { createContract } from "../../application/contract/create-contract";
import { getContractById } from "../../application/contract/get-contract-by-id";
import { signContract } from "../../application/contract/sign-contract";
import { endContract } from "../../application/contract/end-contract";
import { PrismaContractRepository } from "../../infrastructure/persistence/PrismaContractRepository";
import { PrismaPropertyRepository } from "../../infrastructure/persistence/PrismaPropertyRepository";
import { contractDocumentsRouter } from "./contract-documents";
import { prisma } from "../../lib/db";

const contractsRouter = Router();
const contractRepo = PrismaContractRepository;
const propertyRepo = PrismaPropertyRepository;

function requireInternalAuth(req: Request, res: Response): string | null {
  const key = req.headers["x-api-key"];
  const userId = req.headers["x-user-id"] as string | undefined;
  if (key !== env.INTERNAL_API_KEY || !userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return userId;
}

const createContractBody = z.object({
  propertyId: z.string().min(1),
  tenantId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rentAmount: z.number().min(0),
  chargesAmount: z.number().min(0).optional(),
  dueDay: z.number().int().min(1).max(28),
  paymentMethod: z.string().optional().nullable().transform((v) => v || null),
  lateFeePercent: z.number().min(0).optional().nullable().transform((v) => v ?? null),
  interestPercent: z.number().min(0).optional().nullable().transform((v) => v ?? null),
  adjustmentIndex: z.string().optional().nullable().transform((v) => v || null),
  guaranteeType: z.string().optional().nullable().transform((v) => (v && ["CAUCAO", "FIADOR", "SEGURO_FIANCA"].includes(v) ? v : null)),
  guaranteeAmount: z.number().min(0).optional().nullable().transform((v) => v ?? null),
  foroComarca: z.string().optional().nullable().transform((v) => v || null),
  contractCity: z.string().optional().nullable().transform((v) => v || null),
  contractDate: z.string().datetime().optional().nullable().transform((v) => (v ? new Date(v) : null)),
});

contractsRouter.get("/", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { contracts } = await listContractsByTenant(contractRepo, userId);
    res.json({ contracts });
  } catch (e) {
    throw e;
  }
});

contractsRouter.get("/as-owner", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  try {
    const { contracts } = await listContractsByOwner(contractRepo, ownerId);
    res.json({ contracts });
  } catch (e) {
    throw e;
  }
});

contractsRouter.get("/as-owner/documents-pending-count", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  try {
    const count = await prisma.tenantDocument.count({
      where: {
        status: "PENDENTE_ANALISE",
        contract: { ownerId },
      },
    });
    res.json({ count });
  } catch (e) {
    console.error("GET /contracts/as-owner/documents-pending-count error:", e);
    res.status(500).json({ error: "Erro ao carregar." });
  }
});

contractsRouter.use("/:id/documents", contractDocumentsRouter);

contractsRouter.get("/:id", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const detail = await getContractById(contractRepo, userId, id);
    res.json(detail);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    }
    throw e;
  }
});

contractsRouter.patch("/:id/sign", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  const body = (req.body as { as?: string }) ?? {};
  const asRole = body.as === "owner" || body.as === "tenant" ? body.as : undefined;
  const ip = (req.headers["x-client-ip"] as string) || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket?.remoteAddress || undefined;
  const userAgent = ((req.headers["x-client-user-agent"] as string) || req.get("User-Agent")) ?? undefined;
  try {
    const { contract } = await signContract(contractRepo, userId, id, { ip, userAgent, as: asRole });
    res.json({ contract });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    }
    throw e;
  }
});

contractsRouter.patch("/:id/end", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const { contract } = await endContract(contractRepo, propertyRepo, userId, id);
    res.json({ contract });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
      if (e.message === "ALREADY_ENDED") return res.status(400).json({ error: "ALREADY_ENDED" });
    }
    throw e;
  }
});

contractsRouter.post("/", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  try {
    const body = createContractBody.parse(req.body);
    const { contract } = await createContract(contractRepo, propertyRepo, ownerId, {
      propertyId: body.propertyId,
      tenantId: body.tenantId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      rentAmount: body.rentAmount,
      chargesAmount: body.chargesAmount ?? 0,
      dueDay: body.dueDay,
      paymentMethod: body.paymentMethod ?? null,
      lateFeePercent: body.lateFeePercent ?? null,
      interestPercent: body.interestPercent ?? null,
      adjustmentIndex: body.adjustmentIndex ?? null,
      guaranteeType: body.guaranteeType ?? null,
      guaranteeAmount: body.guaranteeAmount ?? null,
      foroComarca: body.foroComarca ?? null,
      contractCity: body.contractCity ?? null,
      contractDate: body.contractDate ?? null,
    });
    res.status(201).json(contract);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    }
    throw e;
  }
});

export { contractsRouter };
