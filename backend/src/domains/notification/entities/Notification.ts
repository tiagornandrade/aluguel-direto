export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: string;
  propertyId: string | null;
  contractId: string | null;
  conversationId: string | null;
  message: string | null;
  read: boolean;
  createdAt: Date;
}
