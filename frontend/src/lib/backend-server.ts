import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

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
  createdAt: string;
  updatedAt: string;
}

export async function getPropertiesForUser(): Promise<Property[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await fetch(`${BACKEND}/api/v1/properties`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { properties: Property[] };
  return data.properties ?? [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await fetch(`${BACKEND}/api/v1/properties/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as Property;
}

export async function getAvailableProperties(): Promise<Property[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await fetch(`${BACKEND}/api/v1/properties/available`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { properties: Property[] };
  return data.properties ?? [];
}

export interface AvailablePropertyWithOwner extends Property {
  ownerEmail: string;
  ownerFullName: string;
}

export async function getAvailablePropertyById(id: string): Promise<AvailablePropertyWithOwner | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await fetch(`${BACKEND}/api/v1/properties/available/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as AvailablePropertyWithOwner;
}

export interface NotificationItem {
  notification: { id: string; senderId: string; type: string; propertyId: string | null; message: string | null; read: boolean; createdAt: string };
  senderName: string;
  propertyTitle: string | null;
}

export async function getNotificationsForUser(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return { notifications: [], unreadCount: 0 };
  const res = await fetch(`${BACKEND}/api/v1/notifications`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return { notifications: [], unreadCount: 0 };
  const data = (await res.json()) as { notifications: NotificationItem[]; unreadCount: number };
  return { notifications: data.notifications ?? [], unreadCount: data.unreadCount ?? 0 };
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
  const res = await fetch(`${BACKEND}/api/v1/contracts`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { contracts: ContractWithDetails[] };
  return data.contracts ?? [];
}

export interface ContractForOwnerItem {
  contract: { id: string; propertyId: string; tenantId: string; startDate: string; endDate: string; rentAmount: number; chargesAmount: number; dueDay: number; status: string };
  property: { id: string; title: string; addressLine: string };
  tenant: { id: string; fullName: string };
}

export async function getContractsForOwner(): Promise<ContractForOwnerItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return [];
  const res = await fetch(`${BACKEND}/api/v1/contracts/as-owner`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { contracts: ContractForOwnerItem[] };
  return data.contracts ?? [];
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
  const res = await fetch(`${BACKEND}/api/v1/users/me`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as UserProfile;
}

export async function getContractById(id: string): Promise<ContractDetail | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !INTERNAL_KEY) return null;
  const res = await fetch(`${BACKEND}/api/v1/contracts/${id}`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as ContractDetail;
}
