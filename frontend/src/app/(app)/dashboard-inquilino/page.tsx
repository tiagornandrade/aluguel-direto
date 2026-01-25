import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardInquilinoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = (session.user as { name?: string }).name ?? "Inquilino";

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black dark:text-white">Olá, {name}</h1>
        <p className="text-[#636f88] dark:text-gray-400">Bem-vindo ao seu dashboard de aluguel. Tudo em ordem.</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold dark:text-white mb-4">Próximo Aluguel</h2>
        <p className="text-[#636f88] dark:text-gray-400">Nenhum contrato ativo.</p>
      </div>
    </div>
  );
}
