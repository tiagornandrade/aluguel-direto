import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";
import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";
import type { Notification } from "../../domains/notification/entities/Notification";

export async function createContactRequest(
  notificationRepo: INotificationRepository,
  propertyRepo: IPropertyRepository,
  input: { senderId: string; propertyId: string; message?: string | null }
): Promise<{ notification: Notification }> {
  const property = await propertyRepo.findAvailableById(input.propertyId);
  if (!property) throw new Error("NOT_FOUND");
  const notification = await notificationRepo.create({
    recipientId: property.ownerId,
    senderId: input.senderId,
    type: "CONTACT_REQUEST",
    propertyId: input.propertyId,
    message: input.message ?? null,
  });
  return { notification };
}
