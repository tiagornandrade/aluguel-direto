import type { Notification } from "../entities/Notification";

export interface CreateNotificationInput {
  recipientId: string;
  senderId: string;
  type: string;
  propertyId?: string | null;
  contractId?: string | null;
  conversationId?: string | null;
  message?: string | null;
}

export interface NotificationWithSender {
  notification: Notification;
  senderName: string;
  propertyTitle?: string | null;
}

export interface SentContactRequestItem {
  notification: Notification;
  recipientName: string;
  propertyTitle: string | null;
}

export interface SentRequestItem {
  notification: Notification;
  recipientName: string;
  propertyTitle: string | null;
}

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByRecipient(recipientId: string): Promise<NotificationWithSender[]>;
  findSentContactRequests(senderId: string): Promise<SentContactRequestItem[]>;
  findSentRequests(senderId: string): Promise<SentRequestItem[]>;
  markAsRead(id: string, recipientId: string): Promise<boolean>;
  markAllAsRead(recipientId: string): Promise<number>;
  countUnread(recipientId: string): Promise<number>;
}
