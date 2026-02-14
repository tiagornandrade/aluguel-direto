import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/backend-server";
import { NovoContratoForm } from "./NovoContratoForm";

type SearchParams = { propertyId?: string; tenantId?: string; tenantName?: string };

export default async function ContratoNovoPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const {role} = session.user as { role?: string };
  if (role !== "PROPRIETARIO") redirect("/contratos");

  const propertyId = typeof searchParams.propertyId === "string" ? searchParams.propertyId : undefined;
  const tenantId = typeof searchParams.tenantId === "string" ? searchParams.tenantId : undefined;
  const tenantName = typeof searchParams.tenantName === "string" ? searchParams.tenantName : undefined;

  const property = propertyId ? await getPropertyById(propertyId) : null;
  if (propertyId && !property) redirect("/contratos");

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <Link href="/contratos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mb-6">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Voltar aos contratos
      </Link>
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Iniciar locação</h1>
      <p className="text-[#636f88] dark:text-gray-400 mb-8">
        Crie um contrato para formalizar a locação com o inquilino. O imóvel passará a status &quot;Alugado&quot;.
      </p>
      <NovoContratoForm
        propertyId={propertyId ?? undefined}
        propertyTitle={property?.title}
        tenantId={tenantId ?? undefined}
        tenantName={tenantName ?? undefined}
        defaultRent={property?.rentAmount ?? undefined}
        defaultCharges={property?.chargesAmount ?? undefined}
      />
    </div>
  );
}
