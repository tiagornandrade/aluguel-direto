import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardProprietarioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = (session.user as { name?: string }).name ?? "Proprietário";

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black dark:text-white">Dashboard do Proprietário</h1>
        <p className="text-[#636f88] dark:text-gray-400 mt-1">Bem-vindo de volta, {name}. Aqui está o resumo do seu portfólio.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#dcdfe5] dark:border-slate-800 shadow-sm">
          <p className="text-[#636f88] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Imóveis Ativos</p>
          <p className="text-3xl font-bold dark:text-white mt-1">0</p>
        </div>
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#dcdfe5] dark:border-slate-800 shadow-sm">
          <p className="text-[#636f88] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Pendências Documentais</p>
          <p className="text-3xl font-bold dark:text-white mt-1">0</p>
        </div>
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#dcdfe5] dark:border-slate-800 shadow-sm">
          <p className="text-[#636f88] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Próximos Recebimentos</p>
          <p className="text-3xl font-bold dark:text-white mt-1">R$ 0,00</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold dark:text-white mb-4">Meus Imóveis</h2>
        <p className="text-[#636f88] dark:text-gray-400 mb-4">Nenhum imóvel cadastrado.</p>
        <Link href="/imoveis/novo" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90">
          Cadastrar imóvel
          <span className="material-symbols-outlined text-lg">add</span>
        </Link>
      </div>
    </div>
  );
}
