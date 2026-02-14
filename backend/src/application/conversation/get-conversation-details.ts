import type { IConversationRepository, ConversationWithDetails } from "../../domains/conversation/repositories/IConversationRepository";

export async function getConversationDetails(
  repo: IConversationRepository,
  conversationId: string,
  userId: string
): Promise<ConversationWithDetails | null> {
  const isParticipant = await repo.isParticipant(conversationId, userId);
  if (!isParticipant) return null;
  return repo.findByIdWithDetails(conversationId);
}
