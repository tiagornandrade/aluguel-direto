import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { createContactRequest } from "../../application/notification/create-contact-request";
import { listNotificationsForUser } from "../../application/notification/list-notifications";
import { markNotificationAsRead } from "../../application/notification/mark-notification-read";
import { markAllNotificationsAsRead } from "../../application/notification/mark-all-notifications-read";
import { PrismaNotificationRepository } from "../../infrastructure/persistence/PrismaNotificationRepository";
import { PrismaPropertyRepository } from "../../infrastructure/persistence/PrismaPropertyRepository";

const notificationsRouter = Router();
const notificationRepo = PrismaNotificationRepository;
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
