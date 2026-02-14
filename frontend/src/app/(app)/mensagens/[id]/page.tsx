import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getConversationById, getMessages } from "@/lib/backend-server";
import { MessageForm } from "./MessageForm";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function MensagemThreadPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const conversationId = params.id;
  const [conversation, messages] = await Promise.all([
    getConversationById(conversationId),
    getMessages(conversationId),
  ]);

  if (!conversation) notFound();

  const userId = session.user.id as string;
  const isOwner = conversation.conversation.ownerId === userId;
  const otherName = isOwner ? conversation.otherParticipant.fullName : conversation.owner.fullName;

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <Link href="/mensagens" className="text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar às mensagens
        </Link>
      </div>

      <div className="flex items-center gap-3 pb-4 border-b border-[#dcdfe5] dark:border-slate-700">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">person</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white">{otherName}</h1>
          <p className="text-sm text-muted dark:text-gray-500">{conversation.property.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-muted dark:text-gray-500 text-sm">Nenhuma mensagem ainda. Envie a primeira.</p>
        ) : (
          messages.map(({ message, sender }) => {
            const isMe = sender.id === userId;
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-gray-200 dark:bg-slate-700 text-ink dark:text-white rounded-bl-md"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-medium opacity-80 mb-0.5">{sender.fullName}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? "text-white/80" : "text-muted dark:text-gray-400"}`}>
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-xl">
        <MessageForm conversationId={conversationId} />
      </div>
    </div>
  );
}
