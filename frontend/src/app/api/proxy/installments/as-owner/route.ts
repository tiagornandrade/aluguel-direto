import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!INTERNAL_KEY) return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  const res = await fetch(`${BACKEND}/api/v1/installments/as-owner`, {
    headers: { "X-User-Id": session.user.id, "X-Api-Key": INTERNAL_KEY },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
