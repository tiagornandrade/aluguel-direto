import type { INotificationRepository, SentRequestItem } from "../../domains/notification/repositories/INotificationRepository";

export async function listSentRequests(
  repo: INotificationRepository,
  senderId: string
): Promise<{ requests: SentRequestItem[] }> {
  const requests = await repo.findSentRequests(senderId);
  return { requests };
}
