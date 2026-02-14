import Link from "next/link";
import { getPropertiesForUser } from "@/lib/backend-server";
import { ExcluirImovelButton } from "./ExcluirImovelButton";

export default async function ImoveisPage({ searchParams }: { searchParams: Promise<{ warn?: string }> }) {
  const properties = await getPropertiesForUser();
  const { warn } = await searchParams;
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      {warn === "fotos" && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          Imóvel cadastrado. Algumas fotos não puderam ser enviadas; você pode adicioná-las ao editar o imóvel.
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black dark:text-white">Imóveis</h1>
        <Link href="/imoveis/novo" className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary/90">
          Novo imóvel
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden">
        {properties.length === 0 ? (
          <p className="p-6 text-[#636f88] dark:text-gray-400">Nenhum imóvel cadastrado.</p>
        ) : (
          <ul className="divide-y divide-[#dcdfe5] dark:divide-slate-700">
            {properties.map((p) => (
              <li key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111318] dark:text-white">{p.title}</p>
                  <p className="text-sm text-[#636f88] dark:text-gray-400">{p.addressLine} · {p.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">{p.status}</span>
                  <Link
                    href={`/imoveis/${p.id}/editar`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dcdfe5] dark:border-slate-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Editar
                  </Link>
                  <ExcluirImovelButton id={p.id} title={p.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
