import type { Notification } from "../entities/Notification";

export interface CreateNotificationInput {
  recipientId: string;
  senderId: string;
  type: string;
  propertyId?: string | null;
  message?: string | null;
}

export interface NotificationWithSender {
  notification: Notification;
  senderName: string;
  propertyTitle?: string | null;
}

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<Notification>;
  findByRecipient(recipientId: string): Promise<NotificationWithSender[]>;
  markAsRead(id: string, recipientId: string): Promise<boolean>;
  markAllAsRead(recipientId: string): Promise<number>;
  countUnread(recipientId: string): Promise<number>;
}
