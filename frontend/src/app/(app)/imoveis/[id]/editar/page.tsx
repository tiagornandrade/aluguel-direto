import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/backend-server";
import { ImovelEditarForm } from "./ImovelEditarForm";

export default async function ImovelEditarPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);
  if (!property) notFound();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <Link
        href="/imoveis"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mb-6"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Voltar aos imóveis
      </Link>
      <h1 className="text-3xl font-bold tracking-tight dark:text-white mb-2">Editar imóvel</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{property.title}</p>
      <ImovelEditarForm property={property} />
    </div>
  );
}
