import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { prisma } from "../../lib/db";
import { createProperty } from "../../application/property/create-property";
import { updateProperty } from "../../application/property/update-property";
import { listPropertiesByOwner } from "../../application/property/list-properties-by-owner";
import { listAvailableProperties } from "../../application/property/list-available-properties";
import { getAvailablePropertyWithOwner } from "../../application/property/get-available-property";
import { PrismaPropertyRepository } from "../../infrastructure/persistence/PrismaPropertyRepository";

const propertiesRouter = Router();
const propertyRepo = PrismaPropertyRepository;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

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
  photos: z.array(z.string().min(1)).optional().default([]),
});

const updateBody = createBody.partial().extend({
  status: z.enum(["DISPONIVEL", "EM_NEGOCIACAO", "ALUGADO", "ENCERRADO"]).optional(),
  photos: z.array(z.string().min(1)).optional(),
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
    console.error("POST /properties error:", e);
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({
      error: "Erro ao cadastrar imóvel. Tente novamente.",
      ...(process.env.NODE_ENV !== "production" && { detail: message }),
    });
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

propertiesRouter.delete("/:id", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  const { id } = req.params;
  const existing = await propertyRepo.findById(id);
  if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
  if (existing.ownerId !== ownerId) return res.status(403).json({ error: "FORBIDDEN" });
  try {
    await propertyRepo.delete(id);
    res.status(204).send();
  } catch (e) {
    console.error("DELETE /properties/:id error:", e);
    return res.status(500).json({ error: "Erro ao excluir imóvel. Tente novamente." });
  }
});

const uploadPhotoBody = z.object({
  contentType: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]).transform((t) => (t === "image/jpg" ? "image/jpeg" : t)),
  data: z.string().min(1), // base64
});

propertiesRouter.post("/:id/photos", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  const { id: propertyId } = req.params;
  const existing = await propertyRepo.findById(propertyId);
  if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
  if (existing.ownerId !== ownerId) return res.status(403).json({ error: "FORBIDDEN" });
  try {
    const body = uploadPhotoBody.parse(req.body);
    const buffer = Buffer.from(body.data, "base64");
    if (buffer.length > MAX_PHOTO_BYTES) return res.status(400).json({ error: "Foto muito grande. Máximo 5 MB." });
    const photo = await prisma.propertyPhoto.create({
      data: { propertyId, contentType: body.contentType, data: buffer },
    });
    await prisma.property.update({
      where: { id: propertyId },
      data: { photos: { push: photo.id } },
    });
    res.status(201).json({ id: photo.id });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    console.error("POST /properties/:id/photos error:", e);
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({
      error: "Erro ao enviar foto. Tente novamente.",
      ...(process.env.NODE_ENV !== "production" && { detail: message }),
    });
  }
});

propertiesRouter.get("/:id/photos/:photoId", async (req, res) => {
  if (requireInternalAuth(req, res) == null) return;
  const { id: propertyId, photoId } = req.params;
  const property = await propertyRepo.findById(propertyId);
  if (!property) return res.status(404).json({ error: "NOT_FOUND" });
  const isOwner = property.ownerId === (req.headers["x-user-id"] as string);
  const isAvailable = ["DISPONIVEL", "EM_NEGOCIACAO"].includes(property.status);
  if (!isOwner && !isAvailable) return res.status(403).json({ error: "FORBIDDEN" });
  const photo = await prisma.propertyPhoto.findFirst({
    where: { id: photoId, propertyId },
  });
  if (!photo) return res.status(404).json({ error: "NOT_FOUND" });
  res.setHeader("Content-Type", photo.contentType);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(photo.data);
});

export { propertiesRouter };
