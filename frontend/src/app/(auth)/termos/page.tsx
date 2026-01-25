import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function TermosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 border-b border-border dark:border-gray-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="text-xl" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted hover:text-primary">Início</Link>
            <Link href="#" className="text-sm font-medium text-muted hover:text-primary">Sobre</Link>
            <Link href="#" className="text-sm font-medium text-muted hover:text-primary">Ajuda</Link>
            <Link href="/login" className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90">Entrar</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1200px] mx-auto w-full px-6 py-8 gap-8">
        {/* Left sidebar - Documentação Legal */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="font-bold dark:text-white mb-1">Documentação Legal</h2>
            <p className="text-sm text-muted dark:text-gray-400 mb-4">SaaS de Infraestrutura Imobiliária</p>
            <nav className="flex flex-col gap-1">
              <Link href="#termos" className="flex items-center gap-2 py-2 text-primary font-semibold">
                <span className="material-symbols-outlined text-lg">description</span>
                Termos de Uso
              </Link>
              <Link href="#privacidade" className="flex items-center gap-2 py-2 text-muted hover:text-primary">
                <span className="material-symbols-outlined text-lg">shield</span>
                Política de Privacidade
              </Link>
              <Link href="#cookies" className="flex items-center gap-2 py-2 text-muted hover:text-primary">
                <span className="material-symbols-outlined text-lg">cookie</span>
                Política de Cookies
              </Link>
              <Link href="#resumo" className="flex items-center gap-2 py-2 text-muted hover:text-primary">
                <span className="material-symbols-outlined text-lg">person</span>
                Resumo para Humanos
              </Link>
            </nav>
            <div className="mt-4">
              <label className="sr-only">Buscar no documento</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg">search</span>
                <input
                  type="search"
                  placeholder="Buscar no documento..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <article id="termos" className="flex-1 min-w-0 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-muted dark:text-gray-500 mb-2">Última atualização: 15 de outubro de 2023</p>
          <h1 className="text-3xl font-bold dark:text-white mb-8">Termos de Uso</h1>

          <section className="mb-8">
            <h2 className="text-xl font-bold dark:text-white mb-3">1. Objeto do Serviço</h2>
            <p className="text-muted dark:text-gray-400 leading-relaxed">
              A plataforma atua como infraestrutura digital que facilita a interação entre locadores e locatários, oferecendo contratos personalizados, vistorias digitais e gestão de pagamentos recorrentes por meio de gateway seguro.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold dark:text-white mb-3">2. Responsabilidades das Partes</h2>
            <ul className="list-decimal list-inside space-y-2 text-muted dark:text-gray-400">
              <li><strong className="text-ink dark:text-white">Locador:</strong> Responsável pela veracidade das informações do imóvel.</li>
              <li><strong className="text-ink dark:text-white">Locatário:</strong> Responsável pelo pagamento em dia e conservação do imóvel.</li>
              <li><strong className="text-ink dark:text-white">Plataforma:</strong> Responsável pela segurança dos dados, disponibilidade das ferramentas digitais e transparência nas transações financeiras.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold dark:text-white mb-3">3. Fluxo de Pagamentos</h2>
            <p className="text-muted dark:text-gray-400 leading-relaxed mb-4">
              Os pagamentos são processados por infraestrutura bancária parceira. A plataforma retém taxa de serviço conforme condições do plano. A plataforma não garante o pagamento por parte do locatário, mas oferece ferramentas de cobrança e histórico de crédito.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 py-2 bg-primary/5 dark:bg-primary/10 rounded-r text-muted dark:text-gray-400 italic">
              A plataforma não garante o pagamento por parte do locatário, mas oferece ferramentas de cobrança e histórico de crédito.
            </blockquote>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold dark:text-white mb-3">4. Vistorias e Contratos</h2>
            <p className="text-muted dark:text-gray-400 leading-relaxed">
              As vistorias realizadas pelo aplicativo têm validade jurídica. Ambas as partes devem assinar digitalmente o laudo. Os contratos gerados pela plataforma estão em conformidade com a Lei do Inquilinato.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold dark:text-white mb-3">5. Rescisão</h2>
            <p className="text-muted dark:text-gray-400 leading-relaxed">
              O uso da plataforma pode ser encerrado a qualquer momento, respeitando as obrigações contratuais vigentes entre locador e locatário que utilizam o gateway de pagamento.
            </p>
          </section>

          <div className="flex flex-wrap gap-3 pt-4">
            <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90">
              <span className="material-symbols-outlined text-lg">download</span>
              Fazer Download em PDF
            </button>
            <button type="button" className="p-2.5 rounded-lg border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" title="Imprimir">
              <span className="material-symbols-outlined">print</span>
            </button>
            <button type="button" className="p-2.5 rounded-lg border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" title="Compartilhar">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </article>

        {/* Right sidebar - Resumo e Ajuda */}
        <aside className="lg:w-72 shrink-0 space-y-6">
          <div className="p-4 rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <h3 className="font-bold dark:text-white flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Resumo Rápido
            </h3>
            <ul className="space-y-2 text-sm text-muted dark:text-gray-400">
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                A plataforma não é imobiliária, mas infraestrutura digital.
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                Seus dados estão protegidos conforme a LGPD.
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                Taxas de serviço são aplicadas apenas em transações confirmadas.
              </li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <h3 className="font-bold dark:text-white mb-2">Precisa de ajuda?</h3>
            <p className="text-sm text-muted dark:text-gray-400 mb-3">
              Caso tenha dúvidas sobre algum termo técnico, nossa equipe jurídica está disponível.
            </p>
            <Link href="#" className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
              Ir para Central de Ajuda
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </Link>
          </div>
        </aside>
      </main>
      <footer className="border-t border-border dark:border-gray-800 py-6">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted dark:text-gray-400">© 2023 Plataforma de Aluguel Direto. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted hover:text-primary">Segurança</Link>
            <Link href="#" className="text-sm text-muted hover:text-primary">Compliance</Link>
            <Link href="#" className="text-sm text-muted hover:text-primary">Contatos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
