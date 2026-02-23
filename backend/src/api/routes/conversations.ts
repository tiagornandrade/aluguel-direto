import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env } from "../../lib/env";
import { listConversationsForUser } from "../../application/conversation/list-conversations-for-user";
import { getConversationDetails } from "../../application/conversation/get-conversation-details";
import { getOrCreateConversation } from "../../application/conversation/get-or-create-conversation";
import { listMessages } from "../../application/conversation/list-messages";
import { sendMessage } from "../../application/conversation/send-message";
import { createNewMessageNotification } from "../../application/notification/create-new-message-notification";
import { PrismaConversationRepository } from "../../infrastructure/persistence/PrismaConversationRepository";
import { PrismaPropertyRepository } from "../../infrastructure/persistence/PrismaPropertyRepository";
import { PrismaNotificationRepository } from "../../infrastructure/persistence/PrismaNotificationRepository";

const conversationsRouter = Router();
const conversationRepo = PrismaConversationRepository;
const propertyRepo = PrismaPropertyRepository;
const notificationRepo = PrismaNotificationRepository;

function requireInternalAuth(req: Request, res: Response): string | null {
  const key = req.headers["x-api-key"];
  const userId = req.headers["x-user-id"] as string | undefined;
  if (key !== env.INTERNAL_API_KEY || !userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return userId;
}

const createConversationBody = z.object({
  propertyId: z.string().min(1),
  otherParticipantId: z.string().min(1),
});

const sendMessageBody = z.object({
  content: z.string().min(1).max(10000),
});

conversationsRouter.get("/", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const { conversations } = await listConversationsForUser(conversationRepo, userId);
    res.json({ conversations });
  } catch (e) {
    throw e;
  }
});

conversationsRouter.get("/:id", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const conversation = await getConversationDetails(conversationRepo, id, userId);
    if (!conversation) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(conversation);
  } catch (e) {
    throw e;
  }
});

conversationsRouter.post("/", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  try {
    const body = createConversationBody.parse(req.body);
    const { conversationId, created } = await getOrCreateConversation(
      conversationRepo,
      propertyRepo,
      userId,
      body.propertyId,
      body.otherParticipantId
    );
    res.status(created ? 201 : 200).json({ conversationId, created });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error && e.message === "NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
    if (e instanceof Error && e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    throw e;
  }
});

conversationsRouter.get("/:id/messages", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const { messages } = await listMessages(conversationRepo, id, userId);
    res.json({ messages });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    throw e;
  }
});

conversationsRouter.post("/:id/messages", async (req, res) => {
  const userId = requireInternalAuth(req, res);
  if (!userId) return;
  const { id: conversationId } = req.params;
  try {
    const body = sendMessageBody.parse(req.body);
    const { message } = await sendMessage(conversationRepo, conversationId, userId, body.content);
    await createNewMessageNotification(
      notificationRepo,
      conversationRepo,
      conversationId,
      userId,
      body.content
    );
    res.status(201).json(message);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors });
    if (e instanceof Error && e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
    throw e;
  }
});

export { conversationsRouter };
