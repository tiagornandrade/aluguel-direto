import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingInquilinoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const actions = [
    { icon: "person", title: "Completar Perfil", desc: "Envie seus documentos de identificação pendentes.", cta: "COMEÇAR →", urgent: false },
    { icon: "edit_document", title: "Assinar Contrato", desc: "Verifique as cláusulas e assine digitalmente.", cta: "URGENTE", urgent: true },
    { icon: "menu_book", title: "Guia do Inquilino", desc: "Regras da casa e dicas para sua nova jornada.", cta: "ACESSAR ↗", urgent: false },
  ];

  const progressSteps = [
    { done: true, icon: "check_circle", label: "Concluído", text: "A unidade na Rua das Flores, 123 foi bloqueada para você." },
    { done: false, inProgress: true, icon: "description", label: "Em análise", text: "Estamos verificando sua identidade e comprovante de renda.", progress: 75 },
    { done: false, icon: "radio_button_unchecked", label: "Pendente", text: "Disponível após aprovação dos documentos." },
    { done: false, icon: "key", label: "Pendente", text: "Agendamento liberado após o primeiro pagamento." },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black dark:text-white mb-2">Tudo pronto para sua nova casa?</h1>
        <p className="text-muted dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Siga os passos abaixo para finalizar seu processo de locação com segurança na nossa infraestrutura digital.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              Ações Prioritárias
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {actions.map((a) => (
                <div key={a.title} className="p-5 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary">{a.icon}</span>
                  </div>
                  <h3 className="font-bold dark:text-white text-sm mb-1">{a.title}</h3>
                  <p className="text-xs text-muted dark:text-gray-400 mb-3">{a.desc}</p>
                  {a.urgent ? (
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold">URGENTE</span>
                  ) : (
                    <Link href="#" className="text-primary text-xs font-bold hover:underline">{a.cta}</Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold dark:text-white mb-4">Progresso da Locação</h2>
            <div className="space-y-4">
              {progressSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      s.done ? "bg-green-100 dark:bg-green-900/40" : s.inProgress ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                      <span className={`material-symbols-outlined text-lg ${
                        s.done ? "text-green-600" : s.inProgress ? "text-primary" : "text-muted"
                      }`}>{s.icon}</span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[24px] bg-gray-200 dark:bg-gray-700 my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-6">
                    <p className={`text-sm font-semibold ${s.done ? "text-green-600" : s.inProgress ? "text-primary" : "text-muted"}`}>{s.label}</p>
                    <p className="text-sm text-muted dark:text-gray-400 mt-0.5">{s.text}</p>
                    {s.inProgress && s.progress != null && (
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="p-5 rounded-2xl bg-primary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <p className="text-sm font-medium opacity-90">Resumo do Primeiro Pagamento</p>
            <p className="text-2xl font-black mt-1">Aluguel + Caução</p>
            <p className="text-3xl font-black mt-2">R$ 3.450,00</p>
            <p className="text-sm mt-2 flex items-center gap-1 opacity-90">
              <span className="material-symbols-outlined text-lg">event</span>
              Vencimento: 15 de Outubro, 2023
            </p>
            <button type="button" className="mt-4 w-full py-3 rounded-xl bg-white text-primary font-bold text-sm hover:bg-gray-100 transition-colors">
              Gerar Boleto / PIX
            </button>
          </div>
          <div className="p-5 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
            <h3 className="font-bold dark:text-white flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              Segurança
            </h3>
            <p className="text-sm text-muted dark:text-gray-400">
              Seus dados e pagamentos estão protegidos por criptografia de ponta a ponta. O valor da caução fica retido em conta garantia até o fim do contrato.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
            <h3 className="font-bold dark:text-white mb-2">Precisa de ajuda?</h3>
            <p className="text-sm text-muted dark:text-gray-400 mb-3">Nosso time de suporte está disponível de Seg. a Sex. das 09h às 18h.</p>
            <Link href="#" className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
              <span className="material-symbols-outlined text-lg">chat</span>
              Falar com consultor
            </Link>
          </div>
          <div className="p-5 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-gray-500 mb-2">Imóvel Reservado</p>
            <div className="flex gap-2">
              <div className="w-20 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="w-20 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
            </div>
            <p className="text-sm font-bold dark:text-white mt-2">Apt 402 - Edifício Horizon</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
