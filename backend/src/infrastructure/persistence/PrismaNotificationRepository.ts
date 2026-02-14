import { prisma } from "../../lib/db";
import type {
  INotificationRepository,
  CreateNotificationInput,
  NotificationWithSender,
} from "../../domains/notification/repositories/INotificationRepository";
import type { Notification } from "../../domains/notification/entities/Notification";

function toNotification(r: {
  id: string;
  recipientId: string;
  senderId: string;
  type: string;
  propertyId: string | null;
  message: string | null;
  read: boolean;
  createdAt: Date;
}): Notification {
  return {
    id: r.id,
    recipientId: r.recipientId,
    senderId: r.senderId,
    type: r.type,
    propertyId: r.propertyId,
    message: r.message,
    read: r.read,
    createdAt: r.createdAt,
  };
}

export const PrismaNotificationRepository: INotificationRepository = {
  async findById(id: string): Promise<Notification | null> {
    const r = await prisma.notification.findUnique({
      where: { id },
    });
    return r ? toNotification(r) : null;
  },

  async create(data: CreateNotificationInput): Promise<Notification> {
    const r = await prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        type: data.type,
        propertyId: data.propertyId ?? null,
        message: data.message ?? null,
      },
    });
    return toNotification(r);
  },

  async findByRecipient(recipientId: string): Promise<NotificationWithSender[]> {
    const rows = await prisma.notification.findMany({
      where: { recipientId },
      include: {
        sender: { select: { fullName: true } },
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      notification: toNotification(r),
      senderName: r.sender.fullName,
      propertyTitle: r.property?.title ?? null,
    }));
  },

  async markAsRead(id: string, recipientId: string): Promise<boolean> {
    const updated = await prisma.notification.updateMany({
      where: { id, recipientId },
      data: { read: true },
    });
    return updated.count > 0;
  },

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { recipientId, read: false },
      data: { read: true },
    });
    return result.count;
  },

  async countUnread(recipientId: string): Promise<number> {
    return prisma.notification.count({
      where: { recipientId, read: false },
    });
  },
};