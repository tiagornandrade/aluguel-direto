import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingProprietarioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = (session.user as { name?: string }).name ?? "Proprietário";

  const steps = [
    { icon: "add_home", title: "Cadastrar Imóvel", desc: "Detalhes e fotos da sua propriedade" },
    { icon: "attach_file", title: "Anexar Documentos", desc: "Identidade e comprovação de posse" },
    { icon: "person_add", title: "Convidar Inquilino", desc: "Envie o convite para o contrato digital" },
  ];

  const helpItems = [
    { icon: "verified_user", title: "Segurança e Contratos", desc: "Como garantimos a validade jurídica" },
    { icon: "payments", title: "Recebimento de Aluguéis", desc: "Prazos e taxas de intermediação digital" },
    { icon: "support_agent", title: "Falar com Consultor", desc: "Suporte humano para tirar suas dúvidas" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black dark:text-white mb-2">Bem-vindo, {name}! Vamos configurar seu primeiro imóvel</h1>
        <p className="text-muted dark:text-gray-400 text-lg">Comece a alugar seu imóvel de forma direta e segura em poucos passos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {steps.map((s) => (
          <div key={s.title} className="p-6 rounded-2xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">{s.icon}</span>
            </div>
            <h2 className="text-lg font-bold dark:text-white mb-2">{s.title}</h2>
            <p className="text-sm text-muted dark:text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center mb-4">
        <Link
          href="/imoveis/novo"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
          Cadastrar Primeiro Imóvel
        </Link>
        <p className="text-sm text-muted dark:text-gray-400 mt-3">Leva apenas 5 minutos para começar</p>
      </div>

      <section className="mt-16 pt-12 border-t border-[#dcdfe5] dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold dark:text-white">Central de Ajuda</h2>
          <Link href="#" className="text-primary font-semibold text-sm hover:underline">Ver todos os guias →</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#dcdfe5] dark:border-slate-700 bg-gray-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
            <div className="text-center">
              <button type="button" className="w-16 h-16 rounded-full bg-white/90 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-primary text-4xl">play_arrow</span>
              </button>
              <p className="font-bold dark:text-white">Como funciona o aluguel direto</p>
              <p className="text-sm text-muted dark:text-gray-400">Tutorial em vídeo · 3 min</p>
            </div>
          </div>
          <div className="space-y-4">
            {helpItems.map((h) => (
              <div key={h.title} className="p-4 rounded-xl border border-[#dcdfe5] dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/30 transition-colors">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{h.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold dark:text-white text-sm">{h.title}</p>
                    <p className="text-xs text-muted dark:text-gray-400">{h.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
