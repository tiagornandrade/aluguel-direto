import type { IConversationRepository } from "../../domains/conversation/repositories/IConversationRepository";
import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";

export async function getOrCreateConversation(
  conversationRepo: IConversationRepository,
  propertyRepo: IPropertyRepository,
  userId: string,
  propertyId: string,
  otherParticipantId: string
): Promise<{ conversationId: string; created: boolean }> {
  const property = await propertyRepo.findById(propertyId);
  if (!property) throw new Error("NOT_FOUND");
  const {ownerId} = property;
  if (userId !== ownerId && userId !== otherParticipantId) throw new Error("FORBIDDEN");
  let conversation = await conversationRepo.findByPropertyAndOther(propertyId, otherParticipantId);
  let created = false;
  if (!conversation) {
    conversation = await conversationRepo.create(propertyId, ownerId, otherParticipantId);
    created = true;
  }
  return { conversationId: conversation.id, created };
}
