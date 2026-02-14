"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { contractsApi, propertiesApi } from "@/lib/api-client";

type Props = {
  propertyId?: string;
  propertyTitle?: string;
  tenantId?: string;
  tenantName?: string;
  defaultRent?: number | null;
  defaultCharges?: number | null;
};

export function NovoContratoForm({ propertyId, propertyTitle, tenantId, tenantName, defaultRent, defaultCharges }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Array<{ id: string; title: string; addressLine: string }>>([]);
  const [form, setForm] = useState({
    propertyId: propertyId ?? "",
    tenantId: tenantId ?? "",
    tenantName: tenantName ?? "",
    startDate: "",
    endDate: "",
    rentAmount: (defaultRent ?? "") as string | number,
    chargesAmount: (defaultCharges ?? "") as string | number,
    dueDay: 5,
    paymentMethod: "",
    lateFeePercent: "" as string | number,
    interestPercent: "" as string | number,
    adjustmentIndex: "",
    guaranteeType: "" as "" | "CAUCAO" | "FIADOR" | "SEGURO_FIANCA",
    guaranteeAmount: "" as string | number,
    foroComarca: "",
    contractCity: "",
    contractDate: "",
  });

  useEffect(() => {
    if (!propertyId) {
      propertiesApi.list().then((r) => setProperties(r.properties.map((p) => ({ id: p.id, title: p.title, addressLine: p.addressLine }))));
    }
  }, [propertyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalPropertyId = form.propertyId || propertyId;
    const finalTenantId = form.tenantId || tenantId;
    if (!finalPropertyId || !finalTenantId || !form.startDate || !form.endDate) {
      setError("Preencha imóvel, inquilino e datas.");
      return;
    }
    const rent = Number(form.rentAmount);
    if (isNaN(rent) || rent < 0) {
      setError("Valor do aluguel inválido.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const body: Parameters<typeof contractsApi.create>[0] = {
        propertyId: finalPropertyId,
        tenantId: finalTenantId,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        rentAmount: rent,
        chargesAmount: Number(form.chargesAmount) || 0,
        dueDay: form.dueDay,
      };
      if (form.paymentMethod.trim()) body.paymentMethod = form.paymentMethod.trim();
      const lateFee = Number(form.lateFeePercent);
      if (!isNaN(lateFee) && lateFee >= 0) body.lateFeePercent = lateFee;
      const interest = Number(form.interestPercent);
      if (!isNaN(interest) && interest >= 0) body.interestPercent = interest;
      if (form.adjustmentIndex.trim()) body.adjustmentIndex = form.adjustmentIndex.trim();
      if (form.guaranteeType) body.guaranteeType = form.guaranteeType;
      const guarAmt = Number(form.guaranteeAmount);
      if (!isNaN(guarAmt) && guarAmt >= 0) body.guaranteeAmount = guarAmt;
      if (form.foroComarca.trim()) body.foroComarca = form.foroComarca.trim();
      if (form.contractCity.trim()) body.contractCity = form.contractCity.trim();
      if (form.contractDate) body.contractDate = new Date(form.contractDate).toISOString();
      await contractsApi.create(body);
      router.push("/contratos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar contrato.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-[#dcdfe5] dark:border-gray-700 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Imóvel</span>
            {propertyId ? (
              <p className="text-[#636f88] dark:text-gray-400 py-2">{propertyTitle ? `Imóvel: ${propertyTitle}` : "Imóvel definido a partir da notificação."}</p>
            ) : (
              <select
                className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
                value={form.propertyId}
                onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
                required
              >
                <option value="">Selecione o imóvel</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} – {p.addressLine}</option>
                ))}
              </select>
            )}
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">ID do inquilino</span>
            <input
              type="text"
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
              placeholder="ID do usuário inquilino (ex.: dev-1)"
              value={form.tenantId}
              onChange={(e) => setForm((f) => ({ ...f, tenantId: e.target.value }))}
              readOnly={!!tenantId}
              required
            />
            {tenantName && <p className="text-sm text-muted dark:text-gray-400">Interessado: {tenantName}</p>}
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Data início</span>
            <input
              type="date"
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Data fim</span>
            <input
              type="date"
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              required
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Aluguel (R$/mês)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
              value={form.rentAmount}
              onChange={(e) => setForm((f) => ({ ...f, rentAmount: e.target.value }))}
              required
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Condomínio (R$/mês)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
              value={form.chargesAmount}
              onChange={(e) => setForm((f) => ({ ...f, chargesAmount: e.target.value }))}
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Dia do vencimento (1-28)</span>
            <input
              type="number"
              min={1}
              max={28}
              className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4"
              value={form.dueDay}
              onChange={(e) => setForm((f) => ({ ...f, dueDay: Number(e.target.value) }))}
              required
            />
          </label>
        </div>
        <div className="md:col-span-2 mt-4 pt-4 border-t border-[#dcdfe5] dark:border-gray-600">
          <h3 className="text-lg font-semibold text-ink dark:text-white mb-3">Dados do documento (opcional)</h3>
        </div>
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Forma de pagamento</span>
            <input type="text" className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" placeholder="ex.: PIX, Transferência, Boleto" value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Multa por atraso (%)</span>
            <input type="number" min={0} step={0.5} className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" placeholder="ex.: 2" value={form.lateFeePercent} onChange={(e) => setForm((f) => ({ ...f, lateFeePercent: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Juros ao mês (%)</span>
            <input type="number" min={0} step={0.1} className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" placeholder="ex.: 1" value={form.interestPercent} onChange={(e) => setForm((f) => ({ ...f, interestPercent: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Índice de reajuste</span>
            <input type="text" className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" placeholder="ex.: IGPM, IPCA" value={form.adjustmentIndex} onChange={(e) => setForm((f) => ({ ...f, adjustmentIndex: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Tipo de garantia</span>
            <select className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" value={form.guaranteeType} onChange={(e) => setForm((f) => ({ ...f, guaranteeType: e.target.value as "" | "CAUCAO" | "FIADOR" | "SEGURO_FIANCA" }))}>
              <option value="">Selecione</option>
              <option value="CAUCAO">Caução</option>
              <option value="FIADOR">Fiador</option>
              <option value="SEGURO_FIANCA">Seguro fiança</option>
            </select>
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Valor da caução (R$)</span>
            <input type="number" min={0} step={0.01} className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" value={form.guaranteeAmount} onChange={(e) => setForm((f) => ({ ...f, guaranteeAmount: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Foro / Comarca</span>
            <input type="text" className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" placeholder="ex.: Comarca de São Paulo" value={form.foroComarca} onChange={(e) => setForm((f) => ({ ...f, foroComarca: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Cidade da assinatura</span>
            <input type="text" className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" value={form.contractCity} onChange={(e) => setForm((f) => ({ ...f, contractCity: e.target.value }))} />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-2">
            <span className="text-[#111318] dark:text-white font-semibold">Data da assinatura</span>
            <input type="date" className="w-full rounded-lg border border-[#dcdfe5] dark:border-gray-600 bg-white dark:bg-gray-700 h-12 px-4" value={form.contractDate} onChange={(e) => setForm((f) => ({ ...f, contractDate: e.target.value }))} />
          </label>
        </div>
      </div>
      {error && <p className="mt-4 text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>}
      <div className="flex gap-3 mt-8">
        <button type="submit" disabled={loading} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Criando…" : "Criar contrato e iniciar locação"}
        </button>
        <Link href="/contratos" className="px-6 py-2.5 rounded-lg border border-[#dcdfe5] dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
