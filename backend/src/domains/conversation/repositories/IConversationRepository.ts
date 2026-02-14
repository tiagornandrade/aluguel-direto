import type { Conversation } from "../entities/Conversation";
import type { Message } from "../entities/Message";

export interface ConversationWithDetails {
  conversation: Conversation;
  property: { id: string; title: string; addressLine: string };
  owner: { id: string; fullName: string };
  otherParticipant: { id: string; fullName: string };
  lastMessage?: { content: string; createdAt: Date } | null;
}

export interface MessageWithSender {
  message: Message;
  sender: { id: string; fullName: string };
}

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByIdWithDetails(id: string): Promise<ConversationWithDetails | null>;
  findByPropertyAndOther(propertyId: string, otherParticipantId: string): Promise<Conversation | null>;
  findConversationsForUser(userId: string): Promise<ConversationWithDetails[]>;
  create(propertyId: string, ownerId: string, otherParticipantId: string): Promise<Conversation>;
  listMessages(conversationId: string): Promise<MessageWithSender[]>;
  createMessage(conversationId: string, senderId: string, content: string): Promise<Message>;
  isParticipant(conversationId: string, userId: string): Promise<boolean>;
}
