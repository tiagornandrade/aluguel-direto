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
