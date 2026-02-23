import type { INotificationRepository, SentContactRequestItem } from "../../domains/notification/repositories/INotificationRepository";

export async function listSentContactRequests(
  repo: INotificationRepository,
  senderId: string
): Promise<{ requests: SentContactRequestItem[] }> {
  const requests = await repo.findSentContactRequests(senderId);
  return { requests };
}
