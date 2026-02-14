import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";

export async function markAllNotificationsAsRead(
  repo: INotificationRepository,
  userId: string
): Promise<{ markedCount: number }> {
  const markedCount = await repo.markAllAsRead(userId);
  return { markedCount };
}
