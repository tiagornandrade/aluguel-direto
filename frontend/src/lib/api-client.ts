const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const authApi = {
  register: (body: { email: string; fullName: string; cpf?: string | null; password: string; role: "PROPRIETARIO" | "INQUILINO" }) =>
    api<{ user: { id: string; email: string; fullName: string; role: string } }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    api<{ user: { id: string; email: string; fullName: string; role: string } }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

async function proxyApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: { ...(init?.body && { "Content-Type": "application/json" }), ...init?.headers },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const propertiesApi = {
  list: () => proxyApi<{ properties: Array<{ id: string; title: string; addressLine: string; type: string; status: string }> }>("/api/proxy/properties"),
  get: (id: string) =>
    proxyApi<{ id: string; ownerId: string; title: string; addressLine: string; type: string; status: string; areaM2: number | null; rooms: number | null; parkingSpots: number | null; rentAmount: number | null; chargesAmount: number | null; createdAt: string; updatedAt: string }>(
      `/api/proxy/properties/${id}`
    ),
  create: (body: { title: string; addressLine: string; type: string; areaM2?: number | null; rooms?: number | null; parkingSpots?: number | null; rentAmount?: number | null; chargesAmount?: number | null }) =>
    proxyApi<{ id: string }>("/api/proxy/properties", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<{ title: string; addressLine: string; type: string; areaM2: number | null; rooms: number | null; parkingSpots: number | null; rentAmount: number | null; chargesAmount: number | null; status: string }>) =>
    proxyApi<{ id: string }>(`/api/proxy/properties/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
};

export const notificationsApi = {
  list: () =>
    proxyApi<{
      notifications: Array<{
        notification: { id: string; type: string; propertyId: string | null; message: string | null; read: boolean; createdAt: string };
        senderName: string;
        propertyTitle: string | null;
      }>;
      unreadCount: number;
    }>("/api/proxy/notifications"),
  unreadCount: () => proxyApi<{ unreadCount: number }>("/api/proxy/notifications/unread-count"),
  sendContactRequest: (body: { propertyId: string; message?: string | null }) =>
    proxyApi<{ id: string }>("/api/proxy/notifications/contact-request", { method: "POST", body: JSON.stringify(body) }),
  markAsRead: (id: string) =>
    proxyApi<{ ok: boolean }>(`/api/proxy/notifications/${id}/read`, { method: "PATCH" }),
  markAllAsRead: () =>
    proxyApi<{ markedCount: number }>("/api/proxy/notifications/mark-all-read", { method: "POST" }),
};

export const usersApi = {
  getMe: () => proxyApi<{ id: string; email: string; fullName: string; cpf: string | null; rg: string | null; nacionalidade: string | null; estadoCivil: string | null; profissao: string | null; endereco: string | null; role: string }>("/api/proxy/users/me"),
  updateProfile: (body: { fullName?: string; cpf?: string | null; rg?: string | null; nacionalidade?: string | null; estadoCivil?: string | null; profissao?: string | null; endereco?: string | null }) =>
    proxyApi<{ id: string }>("/api/proxy/users/me", { method: "PATCH", body: JSON.stringify(body) }),
};

export type CreateContractBody = {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  chargesAmount?: number;
  dueDay: number;
  paymentMethod?: string | null;
  lateFeePercent?: number | null;
  interestPercent?: number | null;
  adjustmentIndex?: string | null;
  guaranteeType?: string | null;
  guaranteeAmount?: number | null;
  foroComarca?: string | null;
  contractCity?: string | null;
  contractDate?: string | null;
};

export const contractsApi = {
  listAsTenant: () => proxyApi<{ contracts: unknown[] }>("/api/proxy/contracts"),
  listAsOwner: () => proxyApi<{ contracts: unknown[] }>("/api/proxy/contracts/as-owner"),
  create: (body: CreateContractBody) =>
    proxyApi<{ id: string }>("/api/proxy/contracts", { method: "POST", body: JSON.stringify(body) }),
  sign: (contractId: string, asRole?: "owner" | "tenant") =>
    proxyApi<{ contract: unknown }>(`/api/proxy/contracts/${contractId}/sign`, {
      method: "PATCH",
      ...(asRole && { body: JSON.stringify({ as: asRole }) }),
    }),
  end: (contractId: string) =>
    proxyApi<{ contract: unknown }>(`/api/proxy/contracts/${contractId}/end`, { method: "PATCH" }),
};
