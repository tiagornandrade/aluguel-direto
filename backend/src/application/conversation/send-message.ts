import type { IConversationRepository } from "../../domains/conversation/repositories/IConversationRepository";
import type { Message } from "../../domains/conversation/entities/Message";

export async function sendMessage(
  repo: IConversationRepository,
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ message: Message }> {
  const isParticipant = await repo.isParticipant(conversationId, senderId);
  if (!isParticipant) throw new Error("FORBIDDEN");
  const message = await repo.createMessage(conversationId, senderId, content.trim());
  return { message };
}
