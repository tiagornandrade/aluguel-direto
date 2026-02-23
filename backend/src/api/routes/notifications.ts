import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { createContactRequest } from "../../application/notification/create-contact-request";
import { listNotificationsForUser } from "../../application/notification/list-notifications";
import { markNotificationAsRead } from "../../application/notification/mark-notification-read";
import { markAllNotificationsAsRead } from "../../application/notification/mark-all-notifications-read";
import { getSenderProfileForContactRequest } from "../../application/notification/get-sender-profile-for-contact";
import { listSentContactRequests } from "../../application/notification/list-sent-contact-requests";
import { listSentRequests } from "../../application/notification/list-sent-requests";
import { createTenantRequest, TENANT_REQUEST_TYPES, type TenantRequestType } from "../../application/notification/create-tenant-request";
import { createOwnerToTenantRequest } from "../../application/notification/create-owner-to-tenant-request";
import { PrismaNotificationRepository } from "../../infrastructure/persistence/PrismaNotificationRepository";
import { PrismaPropertyRepository } from "../../infrastructure/persistence/PrismaPropertyRepository";
import { PrismaContractRepository } from "../../infrastructure/persistence/PrismaContractRepository";
import { prisma } from "../../lib/db";

const notificationsRouter = Router();
const notificationRepo = PrismaNotificationRepository;
const propertyRepo = PrismaPropertyRepository;
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

const contactRequestBody = z.object({
  propertyId: z.string().min(1),
  message: z.string().max(2000).optional().nullable(),
});

notificationsRouter.get("/unread-count", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const count = await notificationRepo.countUnread(userId);
    res.json({ unreadCount: count });
  } catch (e) {
    throw e;
  }
});

notificationsRouter.get("/sent-contact-requests", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { requests } = await listSentContactRequests(notificationRepo, userId);
    const serialized = requests.map((r) => ({
      notification: {
        id: r.notification.id,
        recipientId: r.notification.recipientId,
        senderId: r.notification.senderId,
        type: r.notification.type,
        propertyId: r.notification.propertyId,
        contractId: r.notification.contractId,
        message: r.notification.message,
        read: r.notification.read,
        createdAt: r.notification.createdAt.toISOString(),
      },
      recipientName: r.recipientName,
      propertyTitle: r.propertyTitle,
    }));
    res.json({ requests: serialized });
  } catch (e) {
    throw e;
  }
});

notificationsRouter.get("/sent-requests", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { requests } = await listSentRequests(notificationRepo, userId);
    const serialized = requests.map((r) => ({
      notification: {
        id: r.notification.id,
        recipientId: r.notification.recipientId,
        senderId: r.notification.senderId,
        type: r.notification.type,
        propertyId: r.notification.propertyId,
        contractId: r.notification.contractId,
        message: r.notification.message,
        read: r.notification.read,
        createdAt: r.notification.createdAt.toISOString(),
      },
      recipientName: r.recipientName,
      propertyTitle: r.propertyTitle,
    }));
    res.json({ requests: serialized });
  } catch (e) {
    throw e;
  }
});

const tenantRequestBody = z.object({
  contractId: z.string().min(1),
  type: z.enum(TENANT_REQUEST_TYPES as unknown as [string, ...string[]]),
  message: z.string().max(2000).optional().nullable(),
});

notificationsRouter.post("/tenant-request", async (req, res) => {
  const tenantId = requireInternalAuth(req, res);
  if (!tenantId) return;
  try {
    const body = tenantRequestBody.parse(req.body);
    const { notification } = await createTenantRequest(notificationRepo, contractRepo, {
      tenantId,
      contractId: body.contractId,
      type: body.type as TenantRequestType,
      message: body.message ?? null,
    });
    res.status(201).json({
      id: notification.id,
      type: notification.type,
      contractId: notification.contractId,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
      if (e.message === "INVALID_TYPE") return res.status(400).json({ error: "INVALID_TYPE" });
    }
    throw e;
  }
});

const ownerToTenantRequestBody = z.object({
  contractId: z.string().min(1),
  message: z.string().max(2000).optional().nullable(),
});

notificationsRouter.post("/owner-to-tenant-request", async (req, res) => {
  const ownerId = requireInternalAuth(req, res);
  if (!ownerId) return;
  try {
    const body = ownerToTenantRequestBody.parse(req.body);
    const { notification } = await createOwnerToTenantRequest(notificationRepo, contractRepo, {
      ownerId,
      contractId: body.contractId,
      message: body.message ?? null,
    });
    res.status(201).json({
      id: notification.id,
      type: notification.type,
      contractId: notification.contractId,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
      if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    }
    throw e;
  }
});

notificationsRouter.get("/", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { notifications, unreadCount } = await listNotificationsForUser(notificationRepo, userId);
    res.json({ notifications, unreadCount });
  } catch (e) {
    throw e;
  }
});

notificationsRouter.patch("/:id/read", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const { ok } = await markNotificationAsRead(notificationRepo, id, userId);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ ok: true });
  } catch (e) {
    throw e;
  }
});

notificationsRouter.post("/mark-all-read", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { markedCount } = await markAllNotificationsAsRead(notificationRepo, userId);
    res.json({ markedCount });
  } catch (e) {
    throw e;
  }
});

notificationsRouter.get("/:id/sender-profile", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id: notificationId } = req.params;
  try {
    const result = await getSenderProfileForContactRequest(
      notificationRepo,
      notificationId,
      userId,
      async (senderId) => {
        const u = await prisma.user.findUnique({
          where: { id: senderId },
          select: { fullName: true, profissao: true, endereco: true, cpf: true, rg: true, nacionalidade: true, estadoCivil: true },
        });
        return u
          ? {
              fullName: u.fullName,
              profissao: u.profissao ?? null,
              endereco: u.endereco ?? null,
              cpf: u.cpf ?? null,
              rg: u.rg ?? null,
              nacionalidade: u.nacionalidade ?? null,
              estadoCivil: u.estadoCivil ?? null,
            }
          : null;
      }
    );
    if (!result) return res.status(404).json({ error: "NOT_FOUND" });
    let propertyTitle: string | null = null;
    if (result.propertyId) {
      const prop = await propertyRepo.findById(result.propertyId);
      propertyTitle = prop?.title ?? null;
    }
    res.json({
      profile: result.profile,
      propertyId: result.propertyId,
      propertyTitle,
      message: result.message,
    });
  } catch (e) {
    throw e;
  }
});

notificationsRouter.post("/contact-request", async (req, res) => {
  const senderId = requireInternalAuth(req, res);
  if (!senderId) return;
  try {
    const body = contactRequestBody.parse(req.body);
    const { notification } = await createContactRequest(notificationRepo, propertyRepo, {
      senderId,
      propertyId: body.propertyId,
      message: body.message ?? null,
    });
    res.status(201).json(notification);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error && e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
    throw e;
  }
});

export { notificationsRouter };
