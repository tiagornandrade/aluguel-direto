import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { PrismaUserRepository } from "../../infrastructure/persistence/PrismaUserRepository";
import { updateUserProfile } from "../../application/identity/update-user-profile";

const usersRouter = Router();
const userRepo = PrismaUserRepository;

function requireInternalAuth(req: Request, res: Response): string | null {
  const key = req.headers["x-api-key"];
  const userId = req.headers["x-user-id"] as string | undefined;
  if (key !== env.INTERNAL_API_KEY || !userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return userId;
}

const updateProfileBody = z.object({
  fullName: z.string().min(2).optional(),
  cpf: z.string().optional().nullable().transform((v) => v || null),
  rg: z.string().optional().nullable().transform((v) => v || null),
  nacionalidade: z.string().optional().nullable().transform((v) => v || null),
  estadoCivil: z.string().optional().nullable().transform((v) => v || null),
  profissao: z.string().optional().nullable().transform((v) => v || null),
  endereco: z.string().optional().nullable().transform((v) => v || null),
});

usersRouter.get("/lookup-tenant", async (req, res) => {
  const _callerId = requireInternalAuth(req, res);
  if (!_callerId) return;
  const email = (req.query.email as string)?.trim()?.toLowerCase();
  if (!email) return res.status(400).json({ error: "Missing query: email" });
  try {
    const user = await userRepo.findByEmail(email);
    if (!user || user.role !== "INQUILINO") return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ id: user.id, fullName: user.fullName });
  } catch (e) {
    throw e;
  }
});

usersRouter.get("/me", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const user = await userRepo.findById(userId);
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(user);
  } catch (e) {
    throw e;
  }
});

usersRouter.patch("/me", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const body = updateProfileBody.parse(req.body);
    const user = await updateUserProfile(userRepo, userId, body);
    res.json(user);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    throw e;
  }
});

export { usersRouter };
