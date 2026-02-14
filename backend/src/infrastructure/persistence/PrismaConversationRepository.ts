import { prisma } from "../../lib/db";
import type { IConversationRepository, ConversationWithDetails, MessageWithSender } from "../../domains/conversation/repositories/IConversationRepository";
import type { Conversation } from "../../domains/conversation/entities/Conversation";
import type { Message } from "../../domains/conversation/entities/Message";

function toConversation(r: { id: string; propertyId: string; ownerId: string; otherParticipantId: string; createdAt: Date; updatedAt: Date }): Conversation {
  return {
    id: r.id,
    propertyId: r.propertyId,
    ownerId: r.ownerId,
    otherParticipantId: r.otherParticipantId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function toMessage(r: { id: string; conversationId: string; senderId: string; content: string; createdAt: Date }): Message {
  return {
    id: r.id,
    conversationId: r.conversationId,
    senderId: r.senderId,
    content: r.content,
    createdAt: r.createdAt,
  };
}

export const PrismaConversationRepository: IConversationRepository = {
  async findById(id: string): Promise<Conversation | null> {
    const r = await prisma.conversation.findUnique({ where: { id } });
    return r ? toConversation(r) : null;
  },

  async findByIdWithDetails(id: string): Promise<ConversationWithDetails | null> {
    const r = await prisma.conversation.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, title: true, addressLine: true } },
        owner: { select: { id: true, fullName: true } },
        otherParticipant: { select: { id: true, fullName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true } },
      },
    });
    if (!r) return null;
    return {
      conversation: toConversation(r),
      property: r.property,
      owner: r.owner,
      otherParticipant: r.otherParticipant,
      lastMessage: r.messages[0] ?? null,
    };
  },

  async findByPropertyAndOther(propertyId: string, otherParticipantId: string): Promise<Conversation | null> {
    const r = await prisma.conversation.findUnique({
      where: { propertyId_otherParticipantId: { propertyId, otherParticipantId } },
    });
    return r ? toConversation(r) : null;
  },

  async findConversationsForUser(userId: string): Promise<ConversationWithDetails[]> {
    const rows = await prisma.conversation.findMany({
      where: { OR: [{ ownerId: userId }, { otherParticipantId: userId }] },
      include: {
        property: { select: { id: true, title: true, addressLine: true } },
        owner: { select: { id: true, fullName: true } },
        otherParticipant: { select: { id: true, fullName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => ({
      conversation: toConversation(r),
      property: r.property,
      owner: r.owner,
      otherParticipant: r.otherParticipant,
      lastMessage: r.messages[0] ?? null,
    }));
  },

  async create(propertyId: string, ownerId: string, otherParticipantId: string): Promise<Conversation> {
    const r = await prisma.conversation.create({
      data: { propertyId, ownerId, otherParticipantId },
    });
    return toConversation(r);
  },

  async listMessages(conversationId: string): Promise<MessageWithSender[]> {
    const rows = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({
      message: toMessage(r),
      sender: r.sender,
    }));
  },

  async createMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const [msg] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId, senderId, content },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);
    return toMessage(msg);
  },

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const c = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { ownerId: true, otherParticipantId: true },
    });
    return c ? c.ownerId === userId || c.otherParticipantId === userId : false;
  },
};
