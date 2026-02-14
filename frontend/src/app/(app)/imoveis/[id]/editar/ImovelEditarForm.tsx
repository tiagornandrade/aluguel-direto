"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { propertiesApi } from "@/lib/api-client";
import type { Property } from "@/lib/backend-server";

const TIPOS = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "STUDIO", label: "Studio / Kitnet" },
  { value: "COBERTURA", label: "Cobertura" },
] as const;

const STATUS = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "EM_NEGOCIACAO", label: "Em negociação" },
  { value: "ALUGADO", label: "Alugado" },
  { value: "ENCERRADO", label: "Encerrado" },
] as const;

export function ImovelEditarForm({ property }: { property: Property }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: property.title,
    addressLine: property.addressLine,
    type: property.type,
    areaM2: property.areaM2 ?? "" as string | number,
    rooms: property.rooms ?? "" as string | number,
    parkingSpots: property.parkingSpots ?? "" as string | number,
    rentAmount: property.rentAmount ?? "" as string | number,
    chargesAmount: property.chargesAmount ?? "" as string | number,
    status: property.status,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.addressLine.trim()) {
      setError("Preencha o título e o endereço.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await propertiesApi.update(property.id, {
        title: form.title.trim(),
        addressLine: form.addressLine.trim(),
        type: form.type as "APARTAMENTO" | "CASA" | "STUDIO" | "COBERTURA",
        areaM2: form.areaM2 === "" ? null : Number(form.areaM2),
        rooms: form.rooms === "" ? null : Number(form.rooms),
        parkingSpots: form.parkingSpots === "" ? null : Number(form.parkingSpots),
        rentAmount: form.rentAmount === "" ? null : Number(form.rentAmount),
        chargesAmount: form.chargesAmount === "" ? null : Number(form.chargesAmount),
        status: form.status,
      });
      router.push("/imoveis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-[#dcdfe5] dark:border-gray-700 shadow-sm max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Título</span>
            <input
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Endereço completo</span>
            <input
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.addressLine}
              onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
              required
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Tipo</span>
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
            <span className="text-[#111318] dark:text-white text-base font-semibold">Status</span>
            <select
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              required
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Área (m²)</span>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.areaM2}
              onChange={(e) => setForm((f) => ({ ...f, areaM2: e.target.value }))}
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Quartos</span>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.rooms}
              onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Vagas garagem</span>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.parkingSpots}
              onChange={(e) => setForm((f) => ({ ...f, parkingSpots: e.target.value }))}
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Aluguel (R$)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.rentAmount}
              onChange={(e) => setForm((f) => ({ ...f, rentAmount: e.target.value }))}
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white text-base font-semibold">Condomínio (R$)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
              value={form.chargesAmount}
              onChange={(e) => setForm((f) => ({ ...f, chargesAmount: e.target.value }))}
            />
          </label>
        </div>
      </div>

      {error && <p className="mt-4 text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>}

      <div className="flex flex-wrap gap-3 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Salvando…" : "Salvar alterações"}
        </button>
        <Link
          href="/imoveis"
          className="px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
