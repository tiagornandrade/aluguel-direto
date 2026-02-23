import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getContractById } from "@/lib/backend-server";
import { EnviarAoLocatarioForm } from "@/app/(app)/solicitacoes/enviar-ao-locatario/EnviarAoLocatarioForm";

export default async function EnviarAoLocatarioPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { role } = session.user as { role?: string };
  if (role !== "PROPRIETARIO") redirect(role === "INQUILINO" ? "/dashboard-inquilino" : "/dashboard-proprietario");

  const { contractId } = await searchParams;
  if (!contractId?.trim()) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-10 py-8">
        <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Solicitar ao locatário</h1>
        <p className="text-muted dark:text-gray-400 mb-4">Contrato não informado.</p>
        <Link href="/dashboard-proprietario" className="text-primary font-medium hover:underline">Voltar ao dashboard</Link>
      </div>
    );
  }

  const detail = await getContractById(contractId.trim());
  if (!detail || detail.contract.status !== "ATIVO") {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-10 py-8">
        <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Solicitar ao locatário</h1>
        <p className="text-muted dark:text-gray-400 mb-4">Contrato não encontrado ou não está ativo.</p>
        <Link href="/dashboard-proprietario" className="text-primary font-medium hover:underline">Voltar ao dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Solicitar ao locatário</h1>
      <p className="text-muted dark:text-gray-400 mb-6">
        Envie uma solicitação de troca para <strong>{detail.tenant.fullName}</strong> referente ao imóvel &quot;{detail.property.title}&quot;. O locatário verá na página de Notificações.
      </p>
      <EnviarAoLocatarioForm contractId={detail.contract.id} />
    </div>
  );
}
