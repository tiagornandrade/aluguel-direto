"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { propertiesApi } from "@/lib/api-client";

const TIPOS = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "STUDIO", label: "Studio / Kitnet" },
  { value: "COBERTURA", label: "Cobertura" },
] as const;

export default function ImovelNovoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    addressLine: "",
    type: "APARTAMENTO",
    areaM2: "" as string | number,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Cadastro de Novo Imóvel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Complete as informações para publicar seu anúncio.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-[#dcdfe5] dark:border-gray-700 shadow-sm">
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
                <input
                  className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                  value={form.addressLine}
                  onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                  required
                />
              </label>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>
        )}

        <div className="flex items-center gap-4">
          <Link href="/imoveis" className="px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? "Salvando…" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
