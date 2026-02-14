import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getSenderProfileForContactRequest } from "@/lib/backend-server";

function field(label: string, value: string | null) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted dark:text-gray-500">{label}</dt>
      <dd className="mt-1 text-ink dark:text-white">{value ?? "—"}</dd>
    </div>
  );
}

export default async function PerfilInteressadoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const data = await getSenderProfileForContactRequest(params.id);
  if (!data) notFound();

  const { profile, propertyId, propertyTitle, message } = data;

  return (
    <div className="max-w-[700px] mx-auto px-4 md:px-10 py-8">
      <div className="mb-6">
        <Link href="/notificacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar às notificações
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-ink dark:text-white mb-1">Perfil do interessado</h1>
      {propertyTitle && (
        <p className="text-muted dark:text-gray-400 mb-6">
          Interesse no imóvel
          {propertyId ? (
            <Link href={`/imoveis/${propertyId}/editar`} className="text-primary hover:underline ml-1">
              &quot;{propertyTitle}&quot;
            </Link>
          ) : (
            ` "${propertyTitle}"`
          )}
        </p>
      )}

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-[#dcdfe5] dark:border-slate-700">
          <p className="text-sm font-medium text-muted dark:text-gray-500 mb-1">Mensagem do interessado</p>
          <p className="text-ink dark:text-white whitespace-pre-wrap">{message}</p>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-ink dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Dados cadastrais
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6">
          {field("Nome completo", profile.fullName)}
          {field("Profissão", profile.profissao)}
          {field("CPF", profile.cpf)}
          {field("RG", profile.rg)}
          {field("Nacionalidade", profile.nacionalidade)}
          {field("Estado civil", profile.estadoCivil)}
          <div className="sm:col-span-2">
            {field("Endereço", profile.endereco)}
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">credit_score</span>
          Perfil de crédito
        </h2>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 p-6">
          <p className="text-amber-800 dark:text-amber-200/90 text-sm">
            Integração com bureau de crédito (ex.: Serasa, Boa Vista) prevista para versões futuras. Aqui você poderá consultar score e histórico de crédito do interessado, com consentimento e conformidade à LGPD.
          </p>
          <p className="text-amber-700 dark:text-amber-300/70 text-xs mt-2">
            Em breve
          </p>
        </div>
      </section>
    </div>
  );
}
