import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";

export async function markNotificationAsRead(
  repo: INotificationRepository,
  notificationId: string,
  userId: string
): Promise<{ ok: boolean }> {
  const ok = await repo.markAsRead(notificationId, userId);
  return { ok };
}
