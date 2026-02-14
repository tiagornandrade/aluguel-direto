import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SolicitacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Solicitações</h1>
      <p className="text-muted dark:text-gray-400 mb-6">
        Acompanhe pedidos de interesse, solicitações do proprietário e demais requisições.
      </p>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-muted mb-4 block">pending_actions</span>
        <p className="text-muted dark:text-gray-400 font-medium">Em breve</p>
        <p className="text-sm text-muted dark:text-gray-500 mt-1">
          Esta seção mostrará suas solicitações de interesse em imóveis e mensagens enviadas aos proprietários.
        </p>
      </div>
    </div>
  );
}
