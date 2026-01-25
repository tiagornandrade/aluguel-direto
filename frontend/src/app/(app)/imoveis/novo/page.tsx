"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { propertiesApi } from "@/lib/api-client";

const STEPS = [
  { id: 1, label: "Informações Básicas" },
  { id: 2, label: "Detalhes e Comodidades" },
  { id: 3, label: "Financeiro" },
  { id: 4, label: "Fotos" },
] as const;

const TIPOS = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "STUDIO", label: "Studio / Kitnet" },
  { value: "COBERTURA", label: "Cobertura" },
] as const;

export default function ImovelNovoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    addressLine: "",
    type: "APARTAMENTO",
    areaM2: "" as string | number,
  });

  const progress = (step / 4) * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.addressLine.trim()) {
      setError("Preencha o título e o endereço do imóvel.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await propertiesApi.create({
        title: form.title.trim(),
        addressLine: form.addressLine.trim(),
        type: form.type as "APARTAMENTO" | "CASA" | "STUDIO" | "COBERTURA",
        areaM2: form.areaM2 === "" ? null : Number(form.areaM2),
      });
      router.push("/imoveis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    if (step >= 4) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  const checklist = [
    { done: !!form.title?.trim(), label: "Título Criativo", tip: "Destaque o principal benefício." },
    { done: false, label: "Fotos Profissionais", tip: "Luz natural faz toda a diferença." },
    { done: false, label: "Preço de Mercado", tip: "Pesquise valores na sua região." },
    { done: false, label: "Descrição Detalhada", tip: "Conte sobre a vizinhança." },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Cadastro de Novo Imóvel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Complete as informações para publicar seu anúncio.</p>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-muted dark:text-gray-400 mb-1">Passo {step} de 4</p>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted mt-1">{Math.round(progress)}% concluído</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 mb-8 overflow-x-auto">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shrink-0 ${
              step === s.id ? "bg-primary text-white" : "text-muted dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form id="imovel-form" onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-[#dcdfe5] dark:border-gray-700 shadow-sm">
            {step === 1 && (
              <>
                <h3 className="text-xl font-bold mb-6 dark:text-white">O que vamos alugar hoje?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Título do Imóvel</span>
                      <input
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Ex: Apartamento reformado próximo ao metrô Vila Mariana"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        required
                      />
                      <span className="text-xs text-gray-400">Um bom título ajuda a atrair mais interessados.</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Categoria</span>
                      <select
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        value={form.type}
                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                        required
                      >
                        {TIPOS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Área Total (m²)</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="0"
                        value={form.areaM2}
                        onChange={(e) => setForm((f) => ({ ...f, areaM2: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Endereço Completo</span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xl">location_on</span>
                        <input
                          className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 pl-11 pr-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Comece a digitar o endereço..."
                          value={form.addressLine}
                          onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                          required
                        />
                      </div>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-[#dcdfe5] dark:border-gray-600 flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-muted">location_on</span>
                      <p className="text-sm text-muted dark:text-gray-400">O mapa será atualizado com o endereço</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <div className="py-8 text-center text-muted dark:text-gray-400">
                <p className="font-medium dark:text-white mb-2">Detalhes e Comodidades</p>
                <p className="text-sm">Em breve. Avance para o próximo passo ou volte para editar as informações básicas.</p>
              </div>
            )}
            {step === 3 && (
              <div className="py-8 text-center text-muted dark:text-gray-400">
                <p className="font-medium dark:text-white mb-2">Financeiro</p>
                <p className="text-sm">Em breve.</p>
              </div>
            )}
            {step === 4 && (
              <div className="py-8 text-center text-muted dark:text-gray-400">
                <p className="font-medium dark:text-white mb-2">Fotos</p>
                <p className="text-sm">Em breve.</p>
              </div>
            )}
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>}
        </form>

        {/* Checklist sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-[#dcdfe5] dark:border-gray-700 shadow-sm sticky top-24">
            <h3 className="font-bold dark:text-white flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">checklist</span>
              Checklist de Cadastro
            </h3>
            <p className="text-sm text-muted dark:text-gray-400 mb-4">Siga estas dicas para um anúncio nota 10:</p>
            <ul className="space-y-3 mb-6">
              {checklist.map((c) => (
                <li key={c.label} className="flex gap-3">
                  {c.done ? (
                    <span className="material-symbols-outlined text-green-500 shrink-0">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-muted shrink-0">radio_button_unchecked</span>
                  )}
                  <div>
                    <p className={`text-sm font-medium ${c.done ? "text-primary dark:text-primary" : "text-muted dark:text-gray-400"}`}>{c.label}</p>
                    <p className="text-xs text-muted dark:text-gray-500">{c.tip}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Dica do Especialista</p>
              <p className="text-sm text-muted dark:text-gray-400">
                Imóveis com endereço completo e área precisa recebem até 40% mais visitas agendadas.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-[#dcdfe5] dark:border-gray-800 bg-white dark:bg-background-dark py-4">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            className="order-2 sm:order-1 px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Salvar Rascunho
          </button>
          <p className="order-1 sm:order-2 text-sm text-muted dark:text-gray-400 text-center">Todos os dados são salvos automaticamente.</p>
          <div className="order-3 flex gap-3">
            <Link href="/imoveis" className="px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </Link>
            {step === 4 ? (
              <button
                type="submit"
                form="imovel-form"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-60 inline-flex items-center gap-2"
              >
                {loading ? "Salvando…" : "Cadastrar"}
                <span className="material-symbols-outlined text-lg">check</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm inline-flex items-center gap-2"
              >
                Próximo Passo
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
