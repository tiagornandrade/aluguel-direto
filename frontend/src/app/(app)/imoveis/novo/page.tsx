"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { propertiesApi } from "@/lib/api-client";
import { fetchByCep, formatCep } from "@/lib/viacep";

const STEPS = [
  { id: 1, label: "Informações Básicas" },
  { id: 2, label: "Detalhes e Comodidades" },
  { id: 3, label: "Financeiro" },
  { id: 4, label: "Fotos" },
] as const;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB (igual ao backend)

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
    type: "APARTAMENTO",
    areaM2: "" as string | number,
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    localidade: "",
    uf: "",
    rooms: "" as string | number,
    parkingSpots: "" as string | number,
    rentAmount: "" as string | number,
    chargesAmount: "" as string | number,
    photos: [] as string[],
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const addressLine = [form.logradouro, form.numero && `nº ${form.numero}`, form.bairro, [form.localidade, form.uf].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(", ");

  const handleCepBlur = useCallback(async () => {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      if (form.cep.trim()) setCepError("CEP deve ter 8 dígitos.");
      return;
    }
    setCepError(null);
    setCepLoading(true);
    try {
      const data = await fetchByCep(form.cep);
      if (data) {
        setForm((f) => ({
          ...f,
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
        }));
      } else {
        setCepError("CEP não encontrado.");
      }
    } catch {
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  }, [form.cep]);

  const progress = (step / 4) * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !addressLine.trim()) {
      setError("Preencha o título e o endereço do imóvel.");
      return;
    }
    setError(null);
    setLoading(true);
    const toNum = (v: string | number): number | null => {
      if (v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    try {
      const urlPhotos = form.photos.filter((u) => u.trim().length > 0 && u.startsWith("http"));
      const { id } = await propertiesApi.create({
        title: form.title.trim(),
        addressLine: addressLine.trim(),
        type: form.type as "APARTAMENTO" | "CASA" | "STUDIO" | "COBERTURA",
        areaM2: toNum(form.areaM2),
        rooms: toNum(form.rooms),
        parkingSpots: toNum(form.parkingSpots),
        rentAmount: toNum(form.rentAmount),
        chargesAmount: toNum(form.chargesAmount),
        photos: urlPhotos,
      });
      const normalizeContentType = (t: string) => (t === "image/jpg" ? "image/jpeg" : t);
      let uploadFailCount = 0;
      for (const file of pendingFiles) {
        let contentType = normalizeContentType(file.type || "image/jpeg");
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)) contentType = "image/jpeg";
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1] ?? result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          await propertiesApi.uploadPhoto(id, { contentType, data: base64 });
        } catch {
          uploadFailCount++;
        }
      }
      if (uploadFailCount > 0) {
        router.push("/imoveis?warn=fotos");
      } else {
        router.push("/imoveis");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar. Tente novamente.";
      setError(msg.startsWith("HTTP 5") ? "Erro no servidor. Verifique se o backend está rodando e tente novamente." : msg);
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    if (step >= 4) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    if (step <= 1) return;
    setStep((s) => Math.max(s - 1, 1));
  }

  const hasRent = form.rentAmount !== "" && Number(form.rentAmount) > 0;
  const checklist = [
    { done: !!form.title?.trim(), label: "Título Criativo", tip: "Destaque o principal benefício." },
    { done: !!addressLine?.trim(), label: "Endereço Completo", tip: "Informe o CEP para preencher automaticamente." },
    { done: form.photos.some((u) => u.trim().length > 0) || pendingFiles.length > 0, label: "Fotos Profissionais", tip: "Envie imagens ou adicione links no passo Fotos." },
    { done: hasRent, label: "Preço de Mercado", tip: "Pesquise valores na sua região." },
    { done: !!form.areaM2 && Number(form.areaM2) > 0, label: "Área e Comodidades", tip: "Área e quartos ajudam na decisão." },
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
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">CEP</span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xl">pin_drop</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 pl-11 pr-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="00000-000"
                          value={formatCep(form.cep)}
                          onChange={(e) => {
                          setCepError(null);
                          setForm((f) => ({ ...f, cep: e.target.value.replace(/\D/g, "") }));
                        }}
                          onBlur={handleCepBlur}
                        />
                        {cepLoading && (
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xl animate-spin">progress_activity</span>
                        )}
                      </div>
                      {cepError && <span className="text-xs text-red-600 dark:text-red-400">{cepError}</span>}
                      <span className="text-xs text-gray-400">Digite o CEP e saia do campo para preencher automaticamente.</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Número</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Ex: 123"
                        value={form.numero}
                        onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Logradouro</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Rua, Avenida..."
                        value={form.logradouro}
                        onChange={(e) => setForm((f) => ({ ...f, logradouro: e.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Bairro</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Bairro"
                        value={form.bairro}
                        onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">Cidade</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Cidade"
                        value={form.localidade}
                        onChange={(e) => setForm((f) => ({ ...f, localidade: e.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[#111318] dark:text-white text-base font-semibold">UF</span>
                      <input
                        type="text"
                        maxLength={2}
                        className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary uppercase"
                        placeholder="SP"
                        value={form.uf}
                        onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))}
                        required
                      />
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    {addressLine.trim() ? (
                      <div className="rounded-xl border border-[#dcdfe5] dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700/50">
                        <div className="aspect-video min-h-[200px] w-full relative">
                          <iframe
                            title="Mapa do endereço"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(addressLine)}&output=embed`}
                            className="absolute inset-0 w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-2 text-center text-sm font-medium text-primary hover:underline bg-gray-50 dark:bg-gray-800/50"
                        >
                          Abrir no Google Maps
                        </a>
                      </div>
                    ) : (
                      <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-[#dcdfe5] dark:border-gray-600 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-muted">location_on</span>
                        <p className="text-sm text-muted dark:text-gray-400">O mapa será carregado quando o endereço estiver preenchido</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="text-xl font-bold mb-6 dark:text-white">Detalhes e Comodidades</h3>
                <p className="text-sm text-muted dark:text-gray-400 mb-6">Informe características que ajudam o inquilino a decidir.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] dark:text-white text-base font-semibold">Quartos</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0"
                      value={form.rooms}
                      onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] dark:text-white text-base font-semibold">Vagas de garagem</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0"
                      value={form.parkingSpots}
                      onChange={(e) => setForm((f) => ({ ...f, parkingSpots: e.target.value }))}
                    />
                  </label>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h3 className="text-xl font-bold mb-6 dark:text-white">Financeiro</h3>
                <p className="text-sm text-muted dark:text-gray-400 mb-6">Valores de referência para o anúncio. Podem ser ajustados no contrato.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] dark:text-white text-base font-semibold">Aluguel (R$/mês)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0,00"
                      value={form.rentAmount}
                      onChange={(e) => setForm((f) => ({ ...f, rentAmount: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[#111318] dark:text-white text-base font-semibold">Condomínio (R$/mês)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0,00"
                      value={form.chargesAmount}
                      onChange={(e) => setForm((f) => ({ ...f, chargesAmount: e.target.value }))}
                    />
                  </label>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h3 className="text-xl font-bold mb-2 dark:text-white">Fotos</h3>
                <p className="text-sm text-muted dark:text-gray-400 mb-4">
                  Envie imagens do seu computador (recomendado) ou adicione links. Formatos: JPG, PNG, WebP, GIF. Máximo 5 MB por foto.
                </p>
                <div className="mb-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-primary/10 text-primary font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined">upload_file</span>
                    Enviar imagens do computador
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
                        else setError(null);
                        setPendingFiles((prev) => [...prev, ...valid].slice(0, 20));
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {pendingFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pendingFiles.map((file, i) => (
                        <div key={i} className="relative group">
                          <div className="w-24 h-24 rounded-lg border border-[#dcdfe5] dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-90 group-hover:opacity-100"
                            title="Remover"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted dark:text-gray-500 mb-2">Ou adicione links de imagens:</p>
                <div className="space-y-3">
                  {[...form.photos, ""].map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        className="flex-1 rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-11 px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary"
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
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {(form.photos.some((u) => u.trim()) || pendingFiles.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pendingFiles.map((file, i) => (
                      <div key={`file-${i}`} className="aspect-video rounded-lg border border-[#dcdfe5] dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {form.photos.filter((u) => u.trim().startsWith("http")).map((url, i) => (
                      <div key={`url-${i}`} className="aspect-video rounded-lg border border-[#dcdfe5] dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-sm whitespace-pre-line" role="alert">{error}</p>}
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
          <div className="order-2 sm:order-1 flex gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Voltar
              </button>
            ) : (
              <Link href="/imoveis" className="px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </Link>
            )}
          </div>
          <p className="order-1 sm:order-2 text-sm text-muted dark:text-gray-400 text-center">Passo {step} de 4</p>
          <div className="order-3 flex gap-3">
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
