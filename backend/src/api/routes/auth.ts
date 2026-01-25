import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerUser } from "../../application/identity/register-user";
import { login } from "../../application/identity/login";
import { PrismaUserRepository } from "../../infrastructure/persistence/PrismaUserRepository";

const authRouter = Router();
const userRepo = PrismaUserRepository;

const registerBody = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  cpf: z.string().optional().nullable().transform((v) => v || null),
  password: z.string().min(8),
  role: z.enum(["PROPRIETARIO", "INQUILINO"]),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (req, res) => {
  try {
    const body = registerBody.parse(req.body);
    const { user } = await registerUser(userRepo, (p) => bcrypt.hash(p, 10), body);
    res.status(201).json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error && e.message === "EMAIL_ALREADY_EXISTS")
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    throw e;
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const body = loginBody.parse(req.body);
    const { user } = await login(userRepo, bcrypt.compare, body);
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error && e.message === "INVALID_CREDENTIALS")
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    throw e;
  }
});

export { authRouter };
