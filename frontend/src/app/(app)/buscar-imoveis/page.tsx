import Link from "next/link";
import { getAvailableProperties } from "@/lib/backend-server";

function formatCurrency(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const TYPE_LABEL: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  STUDIO: "Studio / Kitnet",
  COBERTURA: "Cobertura",
};

export default async function BuscarImoveisPage() {
  const properties = await getAvailableProperties();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink dark:text-white">Buscar imóveis</h1>
        <p className="mt-2 text-[#636f88] dark:text-gray-400">
          Imóveis disponíveis para locação. Entre em contato com o proprietário para agendar uma visita.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-muted mb-4 block">search_off</span>
          <h2 className="text-xl font-bold dark:text-white mb-2">Nenhum imóvel disponível no momento</h2>
          <p className="text-sm text-muted dark:text-gray-400 max-w-md mx-auto">
            Os imóveis com status &quot;Disponível&quot; ou &quot;Em negociação&quot; aparecem aqui. Volte em breve ou
            cadastre um imóvel como proprietário.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <li
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-5xl text-gray-400">apartment</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  {TYPE_LABEL[p.type] ?? p.type}
                </span>
                <h2 className="text-lg font-bold text-ink dark:text-white mb-1">{p.title}</h2>
                <p className="text-sm text-[#636f88] dark:text-gray-400 mb-3 line-clamp-2">{p.addressLine}</p>
                <div className="mt-auto flex items-center justify-between gap-4">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(p.rentAmount)}
                    {p.chargesAmount != null && p.chargesAmount > 0 && (
                      <span className="text-sm font-normal text-muted"> + condomínio</span>
                    )}
                  </p>
                  <Link
                    href={`/buscar-imoveis/${p.id}`}
                    className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
