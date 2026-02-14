import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

/** Evita "fetch failed" (backend fora do ar) quebrar a página. */
async function safeFetchResponse(url: string, options: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, options);
  } catch {
    return null;
  }
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  addressLine: string;
  type: string;
  areaM2: number | null;
  rooms: number | null;
  parkingSpots: number | null;
  rentAmount: number | null;
  chargesAmount: number | null;
  status: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getPropertiesForUser(): Promise<Property[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/properties`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { properties?: Property[] } | null;
  return data?.properties ?? [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/properties/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as Property | null;
}

export async function getAvailableProperties(): Promise<Property[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/properties/available`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { properties?: Property[] } | null;
  return data?.properties ?? [];
}

export interface AvailablePropertyWithOwner extends Property {
  ownerEmail: string;
  ownerFullName: string;
}

export async function getAvailablePropertyById(id: string): Promise<AvailablePropertyWithOwner | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/properties/available/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as AvailablePropertyWithOwner | null;
}

export interface NotificationItem {
  notification: { id: string; senderId: string; type: string; propertyId: string | null; message: string | null; read: boolean; createdAt: string };
  senderName: string;
  propertyTitle: string | null;
}

export async function getNotificationsForUser(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return { notifications: [], unreadCount: 0 };
  const res = await safeFetchResponse(`${BACKEND}/api/v1/notifications`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return { notifications: [], unreadCount: 0 };
  const data = (await res.json().catch(() => null)) as { notifications?: NotificationItem[]; unreadCount?: number } | null;
  return { notifications: data?.notifications ?? [], unreadCount: data?.unreadCount ?? 0 };
}

export interface SenderProfileForAnalysis {
  fullName: string;
  profissao: string | null;
  endereco: string | null;
  cpf: string | null;
  rg: string | null;
  nacionalidade: string | null;
  estadoCivil: string | null;
}

export async function getSenderProfileForContactRequest(notificationId: string): Promise<{
  profile: SenderProfileForAnalysis;
  propertyId: string | null;
  propertyTitle: string | null;
  message: string | null;
} | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/notifications/${notificationId}/sender-profile`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as {
    profile: SenderProfileForAnalysis;
    propertyId: string | null;
    propertyTitle: string | null;
    message: string | null;
  } | null;
}

export interface ContractWithDetails {
  contract: {
    id: string;
    propertyId: string;
    tenantId: string;
    ownerId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    chargesAmount: number;
    dueDay: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  property: { id: string; title: string; addressLine: string; type: string };
  owner: { id: string; fullName: string };
}

export async function getContractsForTenant(): Promise<ContractWithDetails[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/contracts`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { contracts?: ContractWithDetails[] } | null;
  return data?.contracts ?? [];
}

export interface ContractForOwnerItem {
  contract: { id: string; propertyId: string; tenantId: string; startDate: string; endDate: string; rentAmount: number; chargesAmount: number; dueDay: number; status: string; ownerSignedAt: string | null };
  property: { id: string; title: string; addressLine: string };
  tenant: { id: string; fullName: string };
}

export async function getContractsForOwner(): Promise<ContractForOwnerItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/contracts/as-owner`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { contracts?: ContractForOwnerItem[] } | null;
  return data?.contracts ?? [];
}

export interface UserForContract {
  id: string;
  fullName: string;
  cpf: string | null;
  rg: string | null;
  nacionalidade: string | null;
  estadoCivil: string | null;
  profissao: string | null;
  endereco: string | null;
}

export interface ContractDetail {
  contract: {
    id: string; propertyId: string; tenantId: string; ownerId: string;
    startDate: string; endDate: string; rentAmount: number; chargesAmount: number; dueDay: number; status: string;
    paymentMethod: string | null; lateFeePercent: number | null; interestPercent: number | null;
    adjustmentIndex: string | null; guaranteeType: string | null; guaranteeAmount: number | null;
    foroComarca: string | null; contractCity: string | null; contractDate: string | null;
    tenantSignedAt: string | null; tenantSignedIp: string | null; tenantSignedUserAgent: string | null;
    ownerSignedAt: string | null; ownerSignedIp: string | null; ownerSignedUserAgent: string | null;
    createdAt: string; updatedAt: string;
  };
  property: { id: string; title: string; addressLine: string; type: string; areaM2: number | null };
  tenant: UserForContract;
  owner: UserForContract;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  cpf: string | null;
  rg: string | null;
  nacionalidade: string | null;
  estadoCivil: string | null;
  profissao: string | null;
  endereco: string | null;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/users/me`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as UserProfile | null;
}

export async function getContractById(id: string): Promise<ContractDetail | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/contracts/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as ContractDetail | null;
}

export interface InstallmentItem {
  installment: {
    id: string;
    contractId: string;
    referenceMonth: number;
    referenceYear: number;
    amount: number;
    dueDate: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  contract: { id: string; dueDay: number; paymentMethod: string | null };
  property: { id: string; title: string; addressLine: string };
  tenant?: { id: string; fullName: string };
  owner?: { id: string; fullName: string };
}

export async function getInstallmentsForTenant(): Promise<InstallmentItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/installments/as-tenant`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { installments?: InstallmentItem[] } | null;
  return data?.installments ?? [];
}

export async function getInstallmentsForOwner(): Promise<InstallmentItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/installments/as-owner`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { installments?: InstallmentItem[] } | null;
  return data?.installments ?? [];
}

export interface InstallmentDetail extends InstallmentItem {
  tenant: { id: string; fullName: string };
  owner: { id: string; fullName: string };
}

export async function getInstallmentById(id: string): Promise<InstallmentDetail | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/installments/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as InstallmentDetail | null;
}

// --- Conversas / Mensagens ---

export interface ConversationListItem {
  conversation: { id: string; propertyId: string; ownerId: string; otherParticipantId: string; createdAt: string; updatedAt: string };
  property: { id: string; title: string; addressLine: string };
  owner: { id: string; fullName: string };
  otherParticipant: { id: string; fullName: string };
  lastMessage: { content: string; createdAt: string } | null;
}

export async function getConversations(): Promise<ConversationListItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/conversations`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { conversations?: ConversationListItem[] } | null;
  return data?.conversations ?? [];
}

export async function getConversationById(id: string): Promise<ConversationListItem | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/conversations/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as ConversationListItem | null;
}

export interface MessageWithSender {
  message: { id: string; conversationId: string; senderId: string; content: string; createdAt: string };
  sender: { id: string; fullName: string };
}

export async function getMessages(conversationId: string): Promise<MessageWithSender[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await safeFetchResponse(`${BACKEND}/api/v1/conversations/${conversationId}/messages`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { messages?: MessageWithSender[] } | null;
  return data?.messages ?? [];
}

export async function createConversation(propertyId: string, otherParticipantId: string): Promise<{ conversationId: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await safeFetchResponse(`${BACKEND}/api/v1/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    body: JSON.stringify({ propertyId, otherParticipantId }),
    cache: "no-store",
  });
  if (!res?.ok) return null;
  const data = (await res.json().catch(() => null)) as { conversationId?: string } | null;
  return data?.conversationId ? { conversationId: data.conversationId } : null;
}

export async function sendMessageAction(conversationId: string, content: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return { ok: false, error: "UNAUTHORIZED" };
  const res = await safeFetchResponse(`${BACKEND}/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    body: JSON.stringify({ content: content.trim() }),
    cache: "no-store",
  });
  if (!res) return { ok: false, error: "Falha de conexão com o servidor." };
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: err.error ?? "Erro ao enviar" };
  }
  return { ok: true };
}
