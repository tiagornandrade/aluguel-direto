import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createConversation } from "@/lib/backend-server";

type SearchParams = { propertyId?: string; otherParticipantId?: string };

export default async function MensagensNovaPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const propertyId = typeof searchParams.propertyId === "string" ? searchParams.propertyId : undefined;
  const otherParticipantId = typeof searchParams.otherParticipantId === "string" ? searchParams.otherParticipantId : undefined;

  if (!propertyId || !otherParticipantId) {
    redirect("/mensagens");
  }

  const result = await createConversation(propertyId, otherParticipantId);
  if (!result) redirect("/mensagens");

  redirect(`/mensagens/${result.conversationId}`);
}
