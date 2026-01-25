import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });

export const metadata: Metadata = {
  title: "AluguelDireto — Infraestrutura de Locação entre Pessoas",
  description: "Contratos, vistorias, documentos e pagamentos para aluguel residencial direto.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={publicSans.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background-light text-ink antialiased dark:bg-background-dark dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
