import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getContractsForTenant,
  getContractsForOwner,
  getContractDocuments,
} from "@/lib/backend-server";
import { DocumentosInquilino } from "./DocumentosInquilino";
import { DocumentosProprietario } from "./DocumentosProprietario";

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role ?? "";
  const isProprietario = role === "PROPRIETARIO";
  const isInquilino = role === "INQUILINO";

  try {
    if (isInquilino) {
      const contracts = await getContractsForTenant();
      const documentsByContract: Record<string, Awaited<ReturnType<typeof getContractDocuments>>[number][]> = {};
      await Promise.all(
        contracts.map(async (c) => {
          const docs = await getContractDocuments(c.contract.id);
          documentsByContract[c.contract.id] = docs;
        })
      );
      return (
      <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
        <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Documentos</h1>
        <p className="text-muted dark:text-gray-400 mb-6">
          Envie os 4 documentos solicitados para cada contrato. O locador analisará e poderá aprovar ou solicitar reenvio.
        </p>
        <DocumentosInquilino contracts={contracts} documentsByContract={documentsByContract} />
      </div>
    );
    }

    if (isProprietario) {
      const contracts = await getContractsForOwner();
      const documentsByContract: Record<string, Awaited<ReturnType<typeof getContractDocuments>>[number][]> = {};
      await Promise.all(
        contracts.map(async (c) => {
          const docs = await getContractDocuments(c.contract.id);
          documentsByContract[c.contract.id] = docs;
        })
      );
      return (
        <div className="max-w-[900px] mx-auto px-4 md:px-10 py-8">
          <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Análise de documentação</h1>
          <p className="text-muted dark:text-gray-400 mb-6">
            Analise os documentos enviados pelos locatários. Aprove ou rejeite cada um; em caso de rejeição, informe o motivo para que o locatário possa reenviar.
          </p>
          <DocumentosProprietario contracts={contracts} documentsByContract={documentsByContract} />
        </div>
      );
    }
  } catch {
    return (
      <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
        <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Documentos</h1>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <p className="text-amber-800 dark:text-amber-200 font-medium">Não foi possível carregar os documentos.</p>
          <p className="text-sm text-muted dark:text-gray-400 mt-1">Verifique se o servidor está rodando e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Documentos</h1>
      <p className="text-muted dark:text-gray-400 mb-6">
        Contratos, comprovantes e documentos do seu aluguel.
      </p>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-muted mb-4 block">folder_open</span>
        <p className="text-muted dark:text-gray-400 font-medium">Em breve</p>
        <p className="text-sm text-muted dark:text-gray-500 mt-1">
          Aqui você poderá acessar e gerenciar documentos conforme seu perfil (locador ou locatário).
        </p>
      </div>
    </div>
  );
}
