import type { INotificationRepository, NotificationWithSender } from "../../domains/notification/repositories/INotificationRepository";

export async function listNotificationsForUser(
  repo: INotificationRepository,
  userId: string
): Promise<{ notifications: NotificationWithSender[]; unreadCount: number }> {
  const [notifications, unreadCount] = await Promise.all([
    repo.findByRecipient(userId),
    repo.countUnread(userId),
  ]);
  return { notifications, unreadCount };
}
