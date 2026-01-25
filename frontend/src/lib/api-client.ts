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

/** Same-origin fetch for BFF/proxy routes (sends NextAuth cookie). */
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
  create: (body: { title: string; addressLine: string; type: string; areaM2?: number | null; rooms?: number | null; parkingSpots?: number | null; rentAmount?: number | null; chargesAmount?: number | null }) =>
    proxyApi<{ id: string }>("/api/proxy/properties", { method: "POST", body: JSON.stringify(body) }),
};
