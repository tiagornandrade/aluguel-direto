export interface Conversation {
  id: string;
  propertyId: string;
  ownerId: string;
  otherParticipantId: string;
  createdAt: Date;
  updatedAt: Date;
}
