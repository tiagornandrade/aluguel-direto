import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HowItWorksTabs } from "@/components/landing/HowItWorksTabs";
import { BackToTop } from "@/components/landing/BackToTop";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border dark:border-gray-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="text-xl" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium hover:text-primary dark:text-gray-300" href="#funcionalidades">
              Funcionalidades
            </a>
            <a className="text-sm font-medium hover:text-primary dark:text-gray-300" href="#como-funciona">
              Como Funciona
            </a>
            <a className="text-sm font-medium hover:text-primary dark:text-gray-300" href="#funcionalidades">
              Segurança
            </a>
            <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2" />
            <Link href="/login" className="text-sm font-bold px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              Login
            </Link>
            <Link
              href="/criar-conta"
              className="bg-primary text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
              Começar Agora
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col gap-12 md:flex-row items-center">
            <div className="flex flex-col gap-8 flex-1">
              <div className="flex flex-col gap-4">
                <span className="bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full w-fit">
                  Inovação Imobiliária
                </span>
                <h1 className="text-ink dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-tight">
                  A infraestrutura completa para o seu aluguel direto
                </h1>
                <p className="text-muted dark:text-gray-400 text-lg md:text-xl font-normal leading-relaxed max-w-[540px]">
                  Alugue sem imobiliárias com total segurança jurídica, gestão de contratos automatizados e pagamentos
                  garantidos em uma única plataforma.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/criar-conta"
                  className="bg-primary text-white text-lg font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
                >
                  Começar Agora
                </Link>
                <Link
                  href="/criar-conta"
                  className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-ink dark:text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-center"
                >
                  Agendar Demonstração
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {["M", "A", "C"].map((initial, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: ["var(--primary)", "var(--accent)", "#0d9488"][i] }}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted dark:text-gray-400 font-medium">
                  Confiado por +5.000 proprietários em todo o Brasil
                </p>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div
                className="w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative z-10 bg-gray-200 dark:bg-gray-700"
                style={{
                  backgroundImage: "url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl z-20 hidden md:flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                <div className="bg-accent/10 p-3 rounded-full text-accent">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">Garantia Jurídica</p>
                  <p className="text-xs text-muted">100% em conformidade com a Lei do Inquilinato</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white dark:bg-background-dark/50 py-24" id="funcionalidades">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col gap-4 mb-16 text-center items-center">
              <h2 className="text-ink dark:text-white text-3xl md:text-5xl font-black tracking-tight max-w-[720px]">
                Tudo o que você precisa para alugar com segurança
              </h2>
              <p className="text-muted dark:text-gray-400 text-lg font-normal max-w-[640px]">
                Eliminamos a burocracia e os custos excessivos das imobiliárias tradicionais com tecnologia de ponta e
                proteção jurídica.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-6 p-8 rounded-2xl border border-border dark:border-gray-800 bg-white dark:bg-background-dark hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">gavel</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold dark:text-white">Contratos Automatizados</h3>
                  <p className="text-muted dark:text-gray-400 leading-relaxed">
                    Geramos contratos customizados com inteligência jurídica, prontos para assinatura digital com validade
                    legal em todo território nacional.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 p-8 rounded-2xl border border-border dark:border-gray-800 bg-white dark:bg-background-dark hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold dark:text-white">Vistorias Digitais</h3>
                  <p className="text-muted dark:text-gray-400 leading-relaxed">
                    Aplicativo exclusivo para vistorias fotográficas detalhadas, com checklist guiado para garantir o
                    estado do imóvel no início e fim do contrato.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 p-8 rounded-2xl border border-border dark:border-gray-800 bg-white dark:bg-background-dark hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold dark:text-white">Pagamentos Seguros</h3>
                  <p className="text-muted dark:text-gray-400 leading-relaxed">
                    Gestão automatizada de cobranças via PIX ou Boleto, com repasses imediatos para o proprietário e
                    controle rigoroso de inadimplência.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-background-light dark:bg-background-dark" id="como-funciona">
          <div className="max-w-[1200px] mx-auto px-6">
            <HowItWorksTabs />
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="bg-primary rounded-[2.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-3xl md:text-5xl font-black max-w-[800px] leading-tight">
                Pronto para modernizar a forma como você aluga seus imóveis?
              </h2>
              <p className="text-white/80 text-lg md:text-xl max-w-[600px]">
                Junte-se a milhares de brasileiros que já economizaram mais de R$ 15 milhões em taxas de corretagem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/criar-conta"
                  className="bg-white text-accent text-lg font-bold px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-xl text-center"
                >
                  Começar agora gratuitamente
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-border dark:border-gray-800 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
              <Logo className="text-lg" />
              <p className="text-sm text-muted dark:text-gray-400">
                A infraestrutura completa para aluguel direto, sem imobiliárias e com 100% de segurança jurídica.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4 dark:text-white">Produto</h5>
              <ul className="flex flex-col gap-2 text-sm text-muted dark:text-gray-400">
                <li>
                  <a className="hover:text-primary" href="#funcionalidades">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#funcionalidades">
                    Segurança
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#funcionalidades">
                    Vistorias
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#funcionalidades">
                    Pagamentos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 dark:text-white">Empresa</h5>
              <ul className="flex flex-col gap-2 text-sm text-muted dark:text-gray-400">
                <li>
                  <a className="hover:text-primary" href="#">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Blog
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Carreiras
                  </a>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/termos">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 dark:text-white">Suporte</h5>
              <ul className="flex flex-col gap-2 text-sm text-muted dark:text-gray-400">
                <li>
                  <a className="hover:text-primary" href="#">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Contato
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    FAQ
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Segurança de Dados
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted dark:text-gray-400">
              © 2024 AluguelDireto Tecnologia S.A. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
<a className="text-muted hover:text-primary" href="#" aria-label="Compartilhar">
              <span className="material-symbols-outlined">share</span>
              </a>
              <a className="text-muted hover:text-primary" href="/termos" aria-label="Termos">
                <span className="material-symbols-outlined">policy</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
