import type { IConversationRepository, MessageWithSender } from "../../domains/conversation/repositories/IConversationRepository";

export async function listMessages(
  repo: IConversationRepository,
  conversationId: string,
  userId: string
): Promise<{ messages: MessageWithSender[] }> {
  const isParticipant = await repo.isParticipant(conversationId, userId);
  if (!isParticipant) throw new Error("FORBIDDEN");
  const messages = await repo.listMessages(conversationId);
  return { messages };
}
