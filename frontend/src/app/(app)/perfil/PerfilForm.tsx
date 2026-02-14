"use client";

import { useState } from "react";
import { usersApi } from "@/lib/api-client";

type Props = {
  defaultValues: {
    fullName: string;
    cpf: string;
    rg: string;
    nacionalidade: string;
    estadoCivil: string;
    profissao: string;
    endereco: string;
  };
};

export function PerfilForm({ defaultValues }: Props) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultValues);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      await usersApi.updateProfile({
        fullName: form.fullName,
        cpf: form.cpf || null,
        rg: form.rg || null,
        nacionalidade: form.nacionalidade || null,
        estadoCivil: form.estadoCivil || null,
        profissao: form.profissao || null,
        endereco: form.endereco || null,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6 md:p-8">
      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">Nome completo</span>
          <input
            type="text"
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">CPF</span>
          <input
            type="text"
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">RG</span>
          <input
            type="text"
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
            value={form.rg}
            onChange={(e) => setForm((f) => ({ ...f, rg: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">Nacionalidade</span>
          <input
            type="text"
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
            placeholder="ex.: Brasileira"
            value={form.nacionalidade}
            onChange={(e) => setForm((f) => ({ ...f, nacionalidade: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">Estado civil</span>
          <select
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
            value={form.estadoCivil}
            onChange={(e) => setForm((f) => ({ ...f, estadoCivil: e.target.value }))}
          >
            <option value="">Selecione</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
            <option value="União estável">União estável</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">Profissão</span>
          <input
            type="text"
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
            value={form.profissao}
            onChange={(e) => setForm((f) => ({ ...f, profissao: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[#111318] dark:text-white font-semibold">Endereço completo</span>
          <textarea
            className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[80px] px-4 py-3"
            placeholder="Rua, número, complemento, bairro, cidade, UF, CEP"
            value={form.endereco}
            onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
          />
        </label>
      </div>
      {error && <p className="mt-4 text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>}
      {saved && <p className="mt-4 text-green-600 dark:text-green-400 text-sm">Dados salvos.</p>}
      <div className="mt-6">
        <button type="submit" disabled={loading} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
