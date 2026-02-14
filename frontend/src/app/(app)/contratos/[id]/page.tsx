import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getContractById } from "@/lib/backend-server";
import { AssinarContratoButton } from "./AssinarContratoButton";
import { EncerrarContratoButton } from "./EncerrarContratoButton";

const BLANK = "________________";

function orBlank(value: string | null | undefined): string {
  return (value && value.trim()) ? value.trim() : BLANK;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function monthsBetween(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44)) || 12;
}

function propertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    STUDIO: "Studio",
    COBERTURA: "Cobertura",
  };
  return map[type] ?? type;
}

export default async function ContratoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const detail = await getContractById(id);
  if (!detail) notFound();

  const { contract, property, tenant, owner } = detail;
  const isOwner = contract.ownerId === session.user.id;
  const isTenant = contract.tenantId === session.user.id;
  const canSignAsOwner = isOwner && !contract.ownerSignedAt;
  const canSignAsTenant = isTenant && !contract.tenantSignedAt;
  const startStr = formatDateShort(contract.startDate);
  const endStr = formatDateShort(contract.endDate);
  const prazoMeses = monthsBetween(contract.startDate, contract.endDate);
  const areaText = property.areaM2 != null ? `${property.areaM2} m²` : BLANK;

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-10 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <Link href="/contratos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar aos contratos
        </Link>
        <span
          className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
            contract.status === "ATIVO"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : contract.status === "PENDENTE_ASSINATURA"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {contract.status === "ATIVO" ? "Ativo" : contract.status === "PENDENTE_ASSINATURA" ? "Pendente de assinatura" : "Encerrado"}
        </span>
      </div>

      {isOwner && (
        <p className="mb-6 text-sm text-muted dark:text-gray-400 print:hidden">
          <Link href={`/imoveis/${property.id}/editar`} className="text-primary hover:underline">
            Ver e editar imóvel
          </Link>
        </p>
      )}

      {(canSignAsOwner || canSignAsTenant) && (
        <AssinarContratoButton
          contractId={contract.id}
          canSign
          role={canSignAsOwner ? "owner" : "tenant"}
        />
      )}

      {isOwner && contract.status === "ATIVO" && (
        <EncerrarContratoButton contractId={contract.id} />
      )}

      {/* Documento do contrato - template jurídico */}
      <article className="bg-white dark:bg-slate-900 rounded-xl border border-[#dcdfe5] dark:border-slate-800 p-6 md:p-10 text-ink dark:text-white print:border-0 print:shadow-none">
        <h1 className="text-xl font-bold text-center mb-8">
          CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL
        </h1>

        <section className="mb-6">
          <h2 className="font-bold mb-2">LOCADOR:</h2>
          <p><strong>Nome:</strong> {owner.fullName}</p>
          <p><strong>Nacionalidade:</strong> {orBlank(owner.nacionalidade)}</p>
          <p><strong>Estado civil:</strong> {orBlank(owner.estadoCivil)}</p>
          <p><strong>Profissão:</strong> {orBlank(owner.profissao)}</p>
          <p><strong>CPF:</strong> {orBlank(owner.cpf)}</p>
          <p><strong>RG:</strong> {orBlank(owner.rg)}</p>
          <p><strong>Endereço:</strong> {orBlank(owner.endereco)}</p>
        </section>

        <section className="mb-6">
          <h2 className="font-bold mb-2">LOCATÁRIO:</h2>
          <p><strong>Nome:</strong> {tenant.fullName}</p>
          <p><strong>Nacionalidade:</strong> {orBlank(tenant.nacionalidade)}</p>
          <p><strong>Estado civil:</strong> {orBlank(tenant.estadoCivil)}</p>
          <p><strong>Profissão:</strong> {orBlank(tenant.profissao)}</p>
          <p><strong>CPF:</strong> {orBlank(tenant.cpf)}</p>
          <p><strong>RG:</strong> {orBlank(tenant.rg)}</p>
          <p><strong>Endereço:</strong> {orBlank(tenant.endereco)}</p>
        </section>

        <p className="mb-8 text-justify">
          As partes acima identificadas firmam o presente contrato de locação residencial, que se regerá pela legislação vigente, especialmente pela Lei nº 8.245/1991, mediante as cláusulas seguintes:
        </p>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 1 – DO IMÓVEL</h2>
          <p className="text-justify mb-2">
            O LOCADOR dá em locação ao LOCATÁRIO o imóvel situado à:
          </p>
          <p><strong>Endereço completo:</strong> {property.addressLine}</p>
          <p><strong>Tipo de imóvel:</strong> {propertyTypeLabel(property.type)}</p>
          <p><strong>Área aproximada:</strong> {areaText}</p>
          <p className="mt-2 text-justify">
            O imóvel será destinado exclusivamente para fins residenciais.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 2 – DO PRAZO</h2>
          <p className="text-justify">
            O prazo da locação será de <strong>{prazoMeses} {prazoMeses === 1 ? "mês" : "meses"}</strong>, iniciando em <strong>{startStr}</strong> e encerrando em <strong>{endStr}</strong>.
          </p>
          <p className="text-justify mt-2">
            Findo o prazo, caso o LOCATÁRIO permaneça no imóvel sem oposição do LOCADOR, a locação passará a vigorar por prazo indeterminado.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 3 – DO VALOR DO ALUGUEL</h2>
          <p className="text-justify mb-2">
            O valor mensal do aluguel será de <strong>R$ {contract.rentAmount.toFixed(2).replace(".", ",")}</strong>, a ser pago até o dia <strong>{contract.dueDay}</strong> de cada mês, por meio de:
          </p>
          <p><strong>Forma de pagamento:</strong> {orBlank(contract.paymentMethod)}</p>
          <p className="text-justify mt-2">
            O atraso no pagamento implicará multa de {contract.lateFeePercent != null ? `${contract.lateFeePercent}%` : "___%"} sobre o valor devido, além de juros de {contract.interestPercent != null ? `${contract.interestPercent}%` : "___%"} ao mês e correção monetária.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 4 – DO REAJUSTE</h2>
          <p className="text-justify">
            O aluguel será reajustado anualmente com base no índice {orBlank(contract.adjustmentIndex)} ou outro que venha a substituí-lo.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 5 – DOS ENCARGOS</h2>
          <p className="text-justify mb-2">São de responsabilidade do LOCATÁRIO:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Contas de água, luz, gás e demais consumos individuais</li>
            <li>Taxas condominiais ordinárias{contract.chargesAmount > 0 ? ` (valor informativo: R$ ${contract.chargesAmount.toFixed(2).replace(".", ",")}/mês)` : ""}</li>
            <li>IPTU, se acordado entre as partes</li>
            <li>Multas decorrentes de infrações ao regulamento interno</li>
          </ul>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 6 – DA GARANTIA</h2>
          <p className="text-justify mb-2">A presente locação será garantida por:</p>
          <p className="mb-1">Opção 1 – Caução no valor de R$ {contract.guaranteeType === "CAUCAO" && contract.guaranteeAmount != null ? contract.guaranteeAmount.toFixed(2).replace(".", ",") : "______"}</p>
          <p className="mb-1">Opção 2 – Fiador{contract.guaranteeType === "FIADOR" ? " (X)" : ""}</p>
          <p className="mb-2">Opção 3 – Seguro fiança{contract.guaranteeType === "SEGURO_FIANCA" ? " (X)" : ""}</p>
          <p className="text-justify">
            Em caso de caução, o valor será devolvido ao final do contrato, corrigido, desde que não existam débitos ou danos no imóvel.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 7 – DO ESTADO DO IMÓVEL</h2>
          <p className="text-justify">
            O LOCATÁRIO declara receber o imóvel em bom estado de conservação, comprometendo-se a devolvê-lo nas mesmas condições, salvo desgaste natural pelo uso normal.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 8 – BENFEITORIAS</h2>
          <p className="text-justify mb-2">
            Benfeitorias somente poderão ser realizadas com autorização por escrito do LOCADOR.
          </p>
          <p className="text-justify">
            Benfeitorias necessárias poderão ser indenizadas, conforme legislação aplicável.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 9 – DA RESCISÃO</h2>
          <p className="text-justify mb-2">O contrato poderá ser rescindido:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Por acordo entre as partes</li>
            <li>Por descumprimento contratual</li>
            <li>Pelo LOCATÁRIO, mediante aviso prévio de 30 dias</li>
          </ul>
          <p className="text-justify mt-2">
            Em caso de rescisão antecipada pelo LOCATÁRIO durante o prazo determinado, poderá ser aplicada multa proporcional ao tempo restante do contrato.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <section className="mb-6">
          <h2 className="font-bold mb-2">CLÁUSULA 10 – DO FORO</h2>
          <p className="text-justify">
            Fica eleito o foro da comarca de {orBlank(contract.foroComarca)} para dirimir quaisquer controvérsias decorrentes deste contrato.
          </p>
        </section>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <p className="text-justify mb-6">
          E por estarem justas e contratadas, assinam o presente instrumento em duas vias de igual teor.
        </p>

        <p className="mb-8"><strong>Cidade:</strong> {orBlank(contract.contractCity)} &nbsp;&nbsp; <strong>Data:</strong> {contract.contractDate ? formatDate(contract.contractDate) : formatDate(contract.createdAt)}</p>

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <p className="text-center font-bold mt-8">LOCADOR</p>
        <p className="text-center text-sm mt-1 text-muted dark:text-gray-400">{owner.fullName}</p>
        {contract.ownerSignedAt && (
          <div className="text-center text-xs text-muted dark:text-gray-500 mt-1 space-y-0.5">
            <p>Assinado em {formatDateTime(contract.ownerSignedAt)}</p>
            <p className="italic">Registro para comprovação: assinatura eletrônica mediante sessão autenticada; endereço IP e identificador do dispositivo registrados pela plataforma.</p>
          </div>
        )}

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <p className="text-center font-bold mt-8">LOCATÁRIO</p>
        <p className="text-center text-sm mt-1 text-muted dark:text-gray-400">{tenant.fullName}</p>
        {contract.tenantSignedAt && (
          <div className="text-center text-xs text-muted dark:text-gray-500 mt-1 space-y-0.5">
            <p>Assinado em {formatDateTime(contract.tenantSignedAt)}</p>
            <p className="italic">Registro para comprovação: assinatura eletrônica mediante sessão autenticada; endereço IP e identificador do dispositivo registrados pela plataforma.</p>
          </div>
        )}

        <hr className="border-t border-[#dcdfe5] dark:border-slate-700 my-6" />

        <p className="text-center mt-6"><strong>Testemunha 1</strong> – CPF: ______</p>
        <p className="text-center mt-6"><strong>Testemunha 2</strong> – CPF: ______</p>
      </article>
    </div>
  );
}
