import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-border dark:border-gray-800 bg-white dark:bg-background-dark py-6 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted dark:text-gray-400">© AluguelDireto. Infraestrutura de locação entre pessoas.</p>
        <div className="flex gap-6">
          <Link href="/termos" className="text-sm text-muted dark:text-gray-400 hover:text-primary">Termos</Link>
          <Link href="/termos" className="text-sm text-muted dark:text-gray-400 hover:text-primary">Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
