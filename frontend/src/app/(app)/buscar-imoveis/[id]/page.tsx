import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailablePropertyById } from "@/lib/backend-server";
import { EntrarEmContatoButton } from "./EntrarEmContatoButton";

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

export default async function BuscarImovelDetalhePage({ params }: { params: { id: string } }) {
  const property = await getAvailablePropertyById(params.id);
  if (!property) notFound();

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <Link
        href="/buscar-imoveis"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mb-6"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Voltar à busca
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 overflow-hidden">
        <div className="h-56 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-gray-400">apartment</span>
        </div>
        <div className="p-6 md:p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {TYPE_LABEL[property.type] ?? property.type}
          </span>
          <h1 className="text-2xl font-bold text-ink dark:text-white mt-1 mb-2">{property.title}</h1>
          <p className="text-[#636f88] dark:text-gray-400 flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-lg">location_on</span>
            {property.addressLine}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {property.areaM2 != null && (
              <div>
                <p className="text-xs text-muted dark:text-gray-500 uppercase font-medium">Área</p>
                <p className="font-semibold dark:text-white">{property.areaM2} m²</p>
              </div>
            )}
            {property.rooms != null && (
              <div>
                <p className="text-xs text-muted dark:text-gray-500 uppercase font-medium">Quartos</p>
                <p className="font-semibold dark:text-white">{property.rooms}</p>
              </div>
            )}
            {property.parkingSpots != null && (
              <div>
                <p className="text-xs text-muted dark:text-gray-500 uppercase font-medium">Vagas</p>
                <p className="font-semibold dark:text-white">{property.parkingSpots}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-[#dcdfe5] dark:border-slate-700">
            <div>
              <p className="text-sm text-muted dark:text-gray-400">Aluguel</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(property.rentAmount)}
                <span className="text-base font-normal text-muted">/mês</span>
              </p>
              {property.chargesAmount != null && property.chargesAmount > 0 && (
                <p className="text-sm text-muted dark:text-gray-400 mt-1">
                  + {formatCurrency(property.chargesAmount)} condomínio
                </p>
              )}
            </div>
            <EntrarEmContatoButton propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
