"use server";

import { revalidatePath } from "next/cache";
import { sendMessageAction } from "@/lib/backend-server";

export async function sendMessage(conversationId: string, content: string) {
  const result = await sendMessageAction(conversationId, content);
  if (result.ok) revalidatePath(`/mensagens/${conversationId}`);
  return result;
}
