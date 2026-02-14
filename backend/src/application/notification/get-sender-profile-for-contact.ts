import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";

export interface SenderProfileForAnalysis {
  fullName: string;
  profissao: string | null;
  endereco: string | null;
  cpf: string | null;
  rg: string | null;
  nacionalidade: string | null;
  estadoCivil: string | null;
}

export async function getSenderProfileForContactRequest(
  notificationRepo: INotificationRepository,
  notificationId: string,
  recipientId: string,
  getSenderProfile: (senderId: string) => Promise<SenderProfileForAnalysis | null>
): Promise<{ profile: SenderProfileForAnalysis; propertyId: string | null; propertyTitle?: string | null; message: string | null } | null> {
  const notification = await notificationRepo.findById(notificationId);
  if (
    !notification ||
    notification.recipientId !== recipientId ||
    notification.type !== "CONTACT_REQUEST"
  ) {
    return null;
  }
  const profile = await getSenderProfile(notification.senderId);
  if (!profile) return null;
  return {
    profile,
    propertyId: notification.propertyId,
    message: notification.message,
    propertyTitle: undefined,
  };
}
