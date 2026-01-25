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
          <Link href="/login" className="text-sm font-bold text-primary hover:underline">Entrar</Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold dark:text-white mb-6">Termos de Uso e Política de Privacidade</h1>
        <p className="text-muted dark:text-gray-400 leading-relaxed mb-6">
          Conteúdo em construção. Consulte a documentação do projeto para as diretrizes de conformidade com a LGPD e os termos do serviço.
        </p>
        <Link href="/" className="text-primary font-bold hover:underline">Voltar ao início</Link>
      </main>
    </div>
  );
}
