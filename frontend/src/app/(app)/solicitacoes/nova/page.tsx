import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContractsForTenant } from "@/lib/backend-server";
import { NovaSolicitacaoForm } from "@/app/(app)/solicitacoes/nova/NovaSolicitacaoForm";

export default async function SolicitacoesNovaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const {role} = session.user as { role?: string };
  if (role !== "INQUILINO") redirect(role === "PROPRIETARIO" ? "/dashboard-proprietario" : "/dashboard-inquilino");

  const contracts = await getContractsForTenant();
  const activeContracts = contracts.filter(
    (c) => c.contract.status === "ATIVO" || c.contract.status === "PENDENTE_ASSINATURA"
  );

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Nova solicitação</h1>
      <p className="text-muted dark:text-gray-400 mb-6">
        Envie um pedido ao locador sobre o imóvel: reparo/manutenção, troca de algo ou solicitação de rescisão do contrato.
      </p>
      <NovaSolicitacaoForm contracts={activeContracts} />
    </div>
  );
}
