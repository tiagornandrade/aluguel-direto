import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";
import type { IConversationRepository } from "../../domains/conversation/repositories/IConversationRepository";

const MESSAGE_PREVIEW_MAX = 120;

export async function createNewMessageNotification(
  notificationRepo: INotificationRepository,
  conversationRepo: IConversationRepository,
  conversationId: string,
  senderId: string,
  content: string
): Promise<void> {
  const conversation = await conversationRepo.findById(conversationId);
  if (!conversation) return;
  const recipientId =
    conversation.ownerId === senderId ? conversation.otherParticipantId : conversation.ownerId;
  if (recipientId === senderId) return;
  const preview =
    content.length <= MESSAGE_PREVIEW_MAX ? content : `${content.slice(0, MESSAGE_PREVIEW_MAX)}…`;
  await notificationRepo.create({
    recipientId,
    senderId,
    type: "NOVA_MENSAGEM",
    conversationId,
    message: preview || null,
  });
}
