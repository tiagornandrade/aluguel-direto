import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getInstallmentById } from "@/lib/backend-server";
import { MarkPaidButton } from "./MarkPaidButton";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(dateStr));
}

function statusLabel(status: string): string {
  if (status === "PAGO") return "Pago";
  if (status === "ATRASADO") return "Atrasado";
  return "Pendente";
}

export default async function PagamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const detail = await getInstallmentById(id);
  if (!detail) notFound();

  const {role} = session.user as { role?: string };
  const isOwner = role === "PROPRIETARIO";

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8">
      <Link href="/pagamentos" className="inline-flex items-center gap-1 text-sm text-primary font-medium mb-6 hover:underline">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Voltar aos pagamentos
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6 md:p-8">
        <h1 className="text-2xl font-bold dark:text-white mb-6">Parcela de aluguel</h1>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">Imóvel</dt>
            <dd className="font-medium dark:text-white">{detail.property.title}</dd>
            <dd className="text-sm text-muted dark:text-gray-400">{detail.property.addressLine}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">Referência</dt>
            <dd className="font-medium dark:text-white">
              {String(detail.installment.referenceMonth).padStart(2, "0")}/{detail.installment.referenceYear}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">Valor</dt>
            <dd className="text-xl font-bold dark:text-white">{formatCurrency(detail.installment.amount)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">Vencimento</dt>
            <dd className="font-medium dark:text-white">{formatDate(detail.installment.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">Status</dt>
            <dd className="font-medium dark:text-white">{statusLabel(detail.installment.status)}</dd>
          </div>
          {detail.installment.paidAt && (
            <div>
              <dt className="text-sm text-muted dark:text-gray-400">Pago em</dt>
              <dd className="font-medium dark:text-white">{formatDate(detail.installment.paidAt)}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">Forma de pagamento (contrato)</dt>
            <dd className="font-medium dark:text-white">{detail.contract.paymentMethod || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted dark:text-gray-400">{isOwner ? "Locatário" : "Locador"}</dt>
            <dd className="font-medium dark:text-white">{isOwner ? detail.tenant.fullName : detail.owner.fullName}</dd>
          </div>
        </dl>

        {isOwner && detail.installment.status !== "PAGO" && (
          <div className="pt-4 border-t border-[#dcdfe5] dark:border-slate-700">
            <p className="text-sm text-muted dark:text-gray-400 mb-2">Recebeu o valor? Marque como pago para registrar.</p>
            <MarkPaidButton installmentId={detail.installment.id} />
          </div>
        )}

        <div className="mt-6">
          <Link href={`/contratos/${detail.contract.id}`} className="text-sm text-primary font-medium hover:underline">
            Ver contrato
          </Link>
        </div>
      </div>
    </div>
  );
}
