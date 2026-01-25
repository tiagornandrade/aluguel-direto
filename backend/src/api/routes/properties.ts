import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { createProperty } from "../../application/property/create-property";
import { listPropertiesByOwner } from "../../application/property/list-properties-by-owner";
import { PrismaPropertyRepository } from "../../infrastructure/persistence/PrismaPropertyRepository";

const propertiesRouter = Router();
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

const createBody = z.object({
  title: z.string().min(1),
  addressLine: z.string().min(1),
  type: z.enum(["APARTAMENTO", "CASA", "STUDIO", "COBERTURA"]),
  areaM2: z.number().optional().nullable(),
  rooms: z.number().int().min(0).optional().nullable(),
  parkingSpots: z.number().int().min(0).optional().nullable(),
  rentAmount: z.number().min(0).optional().nullable(),
  chargesAmount: z.number().min(0).optional().nullable(),
});

propertiesRouter.get("/", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  try {
    const { properties } = await listPropertiesByOwner(propertyRepo, ownerId);
    res.json({ properties });
  } catch (e) {
    throw e;
  }
});

propertiesRouter.get("/:id", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  const { id } = req.params;
  const prop = await propertyRepo.findById(id);
  if (!prop) return res.status(404).json({ error: "NOT_FOUND" });
  if (prop.ownerId !== ownerId) return res.status(403).json({ error: "FORBIDDEN" });
  res.json(prop);
});

propertiesRouter.post("/", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  try {
    const body = createBody.parse(req.body);
    const { property } = await createProperty(propertyRepo, { ...body, ownerId });
    res.status(201).json(property);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    throw e;
  }
});

export { propertiesRouter };
