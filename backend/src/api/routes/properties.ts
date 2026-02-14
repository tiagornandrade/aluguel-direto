import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { createProperty } from "../../application/property/create-property";
import { updateProperty } from "../../application/property/update-property";
import { listPropertiesByOwner } from "../../application/property/list-properties-by-owner";
import { listAvailableProperties } from "../../application/property/list-available-properties";
import { getAvailablePropertyWithOwner } from "../../application/property/get-available-property";
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

const updateBody = createBody.partial().extend({
  status: z.enum(["DISPONIVEL", "EM_NEGOCIACAO", "ALUGADO", "ENCERRADO"]).optional(),
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

propertiesRouter.get("/available", async (req, res) => {
  if (requireInternalAuth(req, res) == null) return;
  try {
    const { properties } = await listAvailableProperties(propertyRepo);
    res.json({ properties });
  } catch (e) {
    throw e;
  }
});

propertiesRouter.get("/available/:id", async (req, res) => {
  if (requireInternalAuth(req, res) == null) return;
  const { id } = req.params;
  const prop = await getAvailablePropertyWithOwner(propertyRepo, id);
  if (!prop) return res.status(404).json({ error: "NOT_FOUND" });
  res.json(prop);
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

propertiesRouter.patch("/:id", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  const { id } = req.params;
  const existing = await propertyRepo.findById(id);
  if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
  if (existing.ownerId !== ownerId) return res.status(403).json({ error: "FORBIDDEN" });
  try {
    const body = updateBody.parse(req.body);
    const property = await updateProperty(propertyRepo, id, body);
    res.json(property);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    throw e;
  }
});

export { propertiesRouter };
