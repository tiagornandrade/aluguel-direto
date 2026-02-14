import type { IConversationRepository, ConversationWithDetails } from "../../domains/conversation/repositories/IConversationRepository";

export async function listConversationsForUser(
  repo: IConversationRepository,
  userId: string
): Promise<{ conversations: ConversationWithDetails[] }> {
  const conversations = await repo.findConversationsForUser(userId);
  return { conversations };
}
