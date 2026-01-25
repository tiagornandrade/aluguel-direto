"use client";

import { useState } from "react";

const stepsProprietarios = [
  { n: 1, title: "Anuncie Grátis", desc: "Cadastre seu imóvel em minutos e publique nos principais portais." },
  { n: 2, title: "Vistoria Digital", desc: "Realize a vistoria guiada pelo app com proteção fotográfica." },
  { n: 3, title: "Assinatura Digital", desc: "Contrato assinado pelo celular com validade jurídica instantânea." },
  { n: 4, title: "Receba o Aluguel", desc: "Pagamento garantido direto na sua conta todos os meses." },
];

const stepsInquilinos = [
  { n: 1, title: "Encontre o Imóvel", desc: "Busque imóveis disponíveis e agende visitas pelos principais portais." },
  { n: 2, title: "Agende a Vistoria", desc: "Participe da vistoria guiada pelo app para documentar o estado do imóvel." },
  { n: 3, title: "Assine o Contrato", desc: "Assinatura digital pelo celular com validade jurídica instantânea." },
  { n: 4, title: "Pague o Aluguel", desc: "PIX ou Boleto com gestão simplificada e repasses seguros." },
];

export function HowItWorksTabs() {
  const [tab, setTab] = useState<"proprietarios" | "inquilinos">("proprietarios");
  const steps = tab === "proprietarios" ? stepsProprietarios : stepsInquilinos;

  return (
    <div className="flex flex-col gap-10 items-center">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4 dark:text-white">Como funciona para você</h2>
        <p className="text-muted dark:text-gray-400 text-lg">
          Processos simplificados para quem quer alugar com agilidade.
        </p>
      </div>
      <div className="w-full max-w-[800px] bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("proprietarios")}
            className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all ${
              tab === "proprietarios"
                ? "text-white bg-primary shadow-lg"
                : "text-muted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Para Proprietários
          </button>
          <button
            type="button"
            onClick={() => setTab("inquilinos")}
            className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all ${
              tab === "inquilinos"
                ? "text-white bg-accent shadow-lg"
                : "text-muted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Para Inquilinos
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full pt-10">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col items-center text-center gap-4">
            <div
              className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-black text-xl mb-2 ${
                tab === "proprietarios" ? "bg-primary" : "bg-accent"
              }`}
            >
              {s.n}
            </div>
            <h4 className="font-bold text-lg dark:text-white">{s.title}</h4>
            <p className="text-sm text-muted dark:text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
