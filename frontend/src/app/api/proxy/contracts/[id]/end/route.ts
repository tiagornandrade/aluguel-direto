import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!INTERNAL_KEY) return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  const { id } = await params;
  const res = await fetch(`${BACKEND}/api/v1/contracts/${id}/end`, {
    method: "PATCH",
    headers: { "X-User-Id": userId, "X-Api-Key": INTERNAL_KEY },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
