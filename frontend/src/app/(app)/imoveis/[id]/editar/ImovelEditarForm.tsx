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

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

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
    photos: (property as { photos?: string[] }).photos ?? [],
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.addressLine.trim()) {
      setError("Preencha o título e o endereço.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const urlPhotos = form.photos.filter((u) => u.trim().length > 0);
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
        photos: urlPhotos,
      });
      const normalizeContentType = (t: string) => (t === "image/jpg" ? "image/jpeg" : t);
      for (const file of pendingFiles) {
        let contentType = normalizeContentType(file.type || "image/jpeg");
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)) contentType = "image/jpeg";
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => { const r = reader.result as string; resolve(r.split(",")[1] ?? r); };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await propertiesApi.uploadPhoto(property.id, { contentType, data: base64 });
      }
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
        <div className="md:col-span-2">
          <span className="text-[#111318] dark:text-white text-base font-semibold block mb-2">Fotos</span>
          <p className="text-sm text-muted dark:text-gray-400 mb-2">Envie novas imagens (JPG, PNG, WebP, GIF — máx. 5 MB cada) ou edite os links.</p>
          <div className="mb-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-primary/10 text-primary font-medium cursor-pointer hover:bg-primary/20 text-sm">
              <span className="material-symbols-outlined text-lg">upload_file</span>
              Enviar imagens
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  const valid = files.filter((f) => f.size <= MAX_PHOTO_BYTES);
                  const rejected = files.length - valid.length;
                  if (rejected > 0) setError(`Algumas imagens passaram de 5 MB e foram ignoradas (${rejected}).`);
                  setPendingFiles((prev) => [...prev, ...valid].slice(0, 20));
                  e.target.value = "";
                }}
              />
            </label>
            {pendingFiles.length > 0 && (
              <span className="ml-2 text-sm text-muted dark:text-gray-500">{pendingFiles.length} nova(s) foto(s) serão enviadas ao salvar.</span>
            )}
          </div>
          <div className="space-y-2">
            {[...form.photos, ""].map((url, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  className="flex-1 rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-11 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  value={url}
                  onChange={(e) => {
                    const next = [...form.photos, ""];
                    next[i] = e.target.value;
                    setForm((f) => ({ ...f, photos: next.filter((s) => s.trim().length > 0) }));
                  }}
                />
                {i < form.photos.length && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))}
                    className="p-2 rounded-lg border border-[#dcdfe5] dark:border-gray-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remover foto"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.photos.some((u) => u.trim()) && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {form.photos.filter((u) => u.trim()).map((u, j) => (
                <div key={j} className="aspect-video rounded-lg border border-[#dcdfe5] dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={u.startsWith("http") ? u : propertiesApi.photoUrl(property.id, u)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              ))}
            </div>
          )}
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
