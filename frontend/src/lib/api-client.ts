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
    const e = await res.json().catch(() => ({})) as { error?: string; detail?: string };
    const msg = e.error ?? `HTTP ${res.status}`;
    const detail = e.detail ? `\n\nDetalhe: ${e.detail}` : "";
    throw new Error(msg + detail);
  }
  return res.json();
}

export const propertiesApi = {
  list: () => proxyApi<{ properties: Array<{ id: string; title: string; addressLine: string; type: string; status: string }> }>("/api/proxy/properties"),
  get: (id: string) =>
    proxyApi<{ id: string; ownerId: string; title: string; addressLine: string; type: string; status: string; areaM2: number | null; rooms: number | null; parkingSpots: number | null; rentAmount: number | null; chargesAmount: number | null; photos: string[]; createdAt: string; updatedAt: string }>(
      `/api/proxy/properties/${id}`
    ),
  create: (body: { title: string; addressLine: string; type: string; areaM2?: number | null; rooms?: number | null; parkingSpots?: number | null; rentAmount?: number | null; chargesAmount?: number | null; photos?: string[] }) =>
    proxyApi<{ id: string }>("/api/proxy/properties", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<{ title: string; addressLine: string; type: string; areaM2: number | null; rooms: number | null; parkingSpots: number | null; rentAmount: number | null; chargesAmount: number | null; status: string; photos: string[] }>) =>
    proxyApi<{ id: string }>(`/api/proxy/properties/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) =>
    fetch(`/api/proxy/properties/${id}`, { method: "DELETE", credentials: "include" }).then((r) => { if (!r.ok) return r.json().then((e: { error?: string }) => { throw new Error((e as { error?: string }).error ?? `HTTP ${r.status}`); }); }),
  uploadPhoto: (propertyId: string, body: { contentType: string; data: string }) =>
    proxyApi<{ id: string }>(`/api/proxy/properties/${propertyId}/photos`, { method: "POST", body: JSON.stringify(body) }),
  photoUrl: (propertyId: string, photoId: string) => `/api/proxy/properties/${propertyId}/photos/${photoId}`,
};

export const notificationsApi = {
  list: () =>
    proxyApi<{
      notifications: Array<{
        notification: {
          id: string;
          type: string;
          propertyId: string | null;
          contractId?: string | null;
          conversationId?: string | null;
          message: string | null;
          read: boolean;
          createdAt: string;
        };
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
  lookupTenant: (email: string) =>
    proxyApi<{ id: string; fullName: string }>(`/api/proxy/users/lookup-tenant?email=${encodeURIComponent(email.trim().toLowerCase())}`),
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

export interface RentInstallmentItem {
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
}

export const installmentsApi = {
  listAsTenant: () =>
    proxyApi<{ installments: Array<{ installment: RentInstallmentItem; contract: { id: string; dueDay: number; paymentMethod: string | null }; property: { id: string; title: string; addressLine: string }; owner: { id: string; fullName: string } }> }>(
      "/api/proxy/installments/as-tenant"
    ),
  listAsOwner: () =>
    proxyApi<{ installments: Array<{ installment: RentInstallmentItem; contract: { id: string; dueDay: number; paymentMethod: string | null }; property: { id: string; title: string; addressLine: string }; tenant: { id: string; fullName: string } }> }>(
      "/api/proxy/installments/as-owner"
    ),
  get: (id: string) =>
    proxyApi<{
      installment: RentInstallmentItem;
      contract: { id: string; dueDay: number; paymentMethod: string | null };
      property: { id: string; title: string; addressLine: string };
      tenant: { id: string; fullName: string };
      owner: { id: string; fullName: string };
    }>(`/api/proxy/installments/${id}`),
  markPaid: (id: string) =>
    proxyApi<{ installment: RentInstallmentItem }>(`/api/proxy/installments/${id}/mark-paid`, { method: "POST" }),
};
