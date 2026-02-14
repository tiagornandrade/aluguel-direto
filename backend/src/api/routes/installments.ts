import { Router, type Request, type Response } from "express";
import { env } from "../../lib/env";
import { listInstallmentsByTenant } from "../../application/installment/list-installments-by-tenant";
import { listInstallmentsByOwner } from "../../application/installment/list-installments-by-owner";
import { getInstallmentById } from "../../application/installment/get-installment-by-id";
import { markInstallmentPaid } from "../../application/installment/mark-installment-paid";
import { PrismaContractRepository } from "../../infrastructure/persistence/PrismaContractRepository";
import { PrismaInstallmentRepository } from "../../infrastructure/persistence/PrismaInstallmentRepository";

const installmentsRouter = Router();
const contractRepo = PrismaContractRepository;
const installmentRepo = PrismaInstallmentRepository;

function requireInternalAuth(req: Request, res: Response): string | null {
  const key = req.headers["x-api-key"];
  const userId = req.headers["x-user-id"] as string | undefined;
  if (key !== env.INTERNAL_API_KEY || !userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return userId;
}

function effectiveStatus(installment: { status: string; dueDate: Date }): string {
  if (installment.status !== "PENDENTE") return installment.status;
  if (new Date() > new Date(installment.dueDate)) return "ATRASADO";
  return "PENDENTE";
}

installmentsRouter.get("/as-tenant", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { installments } = await listInstallmentsByTenant(contractRepo, installmentRepo, userId);
    const withStatus = installments.map((item) => ({
      ...item,
      installment: { ...item.installment, status: effectiveStatus(item.installment) },
    }));
    res.json({ installments: withStatus });
  } catch (e) {
    throw e;
  }
});

installmentsRouter.get("/as-owner", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { installments } = await listInstallmentsByOwner(contractRepo, installmentRepo, userId);
    const withStatus = installments.map((item) => ({
      ...item,
      installment: { ...item.installment, status: effectiveStatus(item.installment) },
    }));
    res.json({ installments: withStatus });
  } catch (e) {
    throw e;
  }
});

installmentsRouter.get("/:id", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const detail = await getInstallmentById(contractRepo, installmentRepo, userId, id);
    const status = effectiveStatus(detail.installment);
    res.json({
      ...detail,
      installment: { ...detail.installment, status },
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    }
    throw e;
  }
});

installmentsRouter.post("/:id/mark-paid", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const { installment } = await markInstallmentPaid(contractRepo, installmentRepo, userId, id);
    res.json({ installment });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    }
    throw e;
  }
});

export { installmentsRouter };
