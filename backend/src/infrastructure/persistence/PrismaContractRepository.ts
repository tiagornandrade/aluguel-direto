import { prisma } from "../../lib/db";
import type {
  IContractRepository,
  ContractWithDetails,
  ContractWithDetailsForOwner,
  ContractDetail,
  CreateContractInput,
  UserForContract,
} from "../../domains/contract/repositories/IContractRepository";
import type { Contract } from "../../domains/contract/entities/Contract";

function toContract(r: {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  chargesAmount: number;
  dueDay: number;
  status: string;
  paymentMethod?: string | null;
  lateFeePercent?: number | null;
  interestPercent?: number | null;
  adjustmentIndex?: string | null;
  guaranteeType?: string | null;
  guaranteeAmount?: number | null;
  foroComarca?: string | null;
  contractCity?: string | null;
  contractDate?: Date | null;
  tenantSignedAt?: Date | null;
  tenantSignedIp?: string | null;
  tenantSignedUserAgent?: string | null;
  ownerSignedAt?: Date | null;
  ownerSignedIp?: string | null;
  ownerSignedUserAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Contract {
  return {
    id: r.id,
    propertyId: r.propertyId,
    tenantId: r.tenantId,
    ownerId: r.ownerId,
    startDate: r.startDate,
    endDate: r.endDate,
    rentAmount: r.rentAmount,
    chargesAmount: r.chargesAmount,
    dueDay: r.dueDay,
    status: r.status as Contract["status"],
    paymentMethod: r.paymentMethod ?? null,
    lateFeePercent: r.lateFeePercent ?? null,
    interestPercent: r.interestPercent ?? null,
    adjustmentIndex: r.adjustmentIndex ?? null,
    guaranteeType: r.guaranteeType ?? null,
    guaranteeAmount: r.guaranteeAmount ?? null,
    foroComarca: r.foroComarca ?? null,
    contractCity: r.contractCity ?? null,
    contractDate: r.contractDate ?? null,
    tenantSignedAt: r.tenantSignedAt ?? null,
    tenantSignedIp: r.tenantSignedIp ?? null,
    tenantSignedUserAgent: r.tenantSignedUserAgent ?? null,
    ownerSignedAt: r.ownerSignedAt ?? null,
    ownerSignedIp: r.ownerSignedIp ?? null,
    ownerSignedUserAgent: r.ownerSignedUserAgent ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function toUserForContract(u: { id: string; fullName: string; cpf: string | null; rg: string | null; nacionalidade: string | null; estadoCivil: string | null; profissao: string | null; endereco: string | null }): UserForContract {
  return {
    id: u.id,
    fullName: u.fullName,
    cpf: u.cpf ?? null,
    rg: u.rg ?? null,
    nacionalidade: u.nacionalidade ?? null,
    estadoCivil: u.estadoCivil ?? null,
    profissao: u.profissao ?? null,
    endereco: u.endereco ?? null,
  };
}

export const PrismaContractRepository: IContractRepository = {
  async create(data: CreateContractInput): Promise<Contract> {
    const r = await prisma.contract.create({
      data: {
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        ownerId: data.ownerId,
        startDate: data.startDate,
        endDate: data.endDate,
        rentAmount: data.rentAmount,
        chargesAmount: data.chargesAmount ?? 0,
        dueDay: data.dueDay,
        status: "PENDENTE_ASSINATURA",
        paymentMethod: data.paymentMethod ?? null,
        lateFeePercent: data.lateFeePercent ?? null,
        interestPercent: data.interestPercent ?? null,
        adjustmentIndex: data.adjustmentIndex ?? null,
        guaranteeType: data.guaranteeType ?? null,
        guaranteeAmount: data.guaranteeAmount ?? null,
        foroComarca: data.foroComarca ?? null,
        contractCity: data.contractCity ?? null,
        contractDate: data.contractDate ?? null,
      },
    });
    return toContract(r);
  },

  async findByTenant(tenantId: string): Promise<ContractWithDetails[]> {
    const rows = await prisma.contract.findMany({
      where: { tenantId },
      include: {
        property: true,
        owner: true,
      },
      orderBy: { startDate: "desc" },
    });
    return rows.map((r) => ({
      contract: toContract(r),
      property: {
        id: r.property.id,
        title: r.property.title,
        addressLine: r.property.addressLine,
        type: r.property.type,
      },
      owner: {
        id: r.owner.id,
        fullName: r.owner.fullName,
      },
    }));
  },

  async findByOwner(ownerId: string): Promise<ContractWithDetailsForOwner[]> {
    const rows = await prisma.contract.findMany({
      where: { ownerId },
      include: {
        property: { select: { id: true, title: true, addressLine: true } },
        tenant: { select: { id: true, fullName: true } },
      },
      orderBy: { startDate: "desc" },
    });
    return rows.map((r) => ({
      contract: toContract(r),
      property: {
        id: r.property.id,
        title: r.property.title,
        addressLine: r.property.addressLine,
      },
      tenant: {
        id: r.tenant.id,
        fullName: r.tenant.fullName,
      },
    }));
  },

  async findById(id: string): Promise<ContractDetail | null> {
    const r = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, title: true, addressLine: true, type: true, areaM2: true } },
        tenant: { select: { id: true, fullName: true, cpf: true, rg: true, nacionalidade: true, estadoCivil: true, profissao: true, endereco: true } },
        owner: { select: { id: true, fullName: true, cpf: true, rg: true, nacionalidade: true, estadoCivil: true, profissao: true, endereco: true } },
      },
    });
    if (!r) return null;
    return {
      contract: toContract(r),
      property: {
        id: r.property.id,
        title: r.property.title,
        addressLine: r.property.addressLine,
        type: r.property.type,
        areaM2: r.property.areaM2,
      },
      tenant: toUserForContract(r.tenant),
      owner: toUserForContract(r.owner),
    };
  },

  async setTenantSignedAt(contractId: string, signedAt: Date, ip?: string | null, userAgent?: string | null): Promise<Contract | null> {
    const r = await prisma.contract.updateMany({
      where: { id: contractId },
      data: {
        tenantSignedAt: signedAt,
        ...(ip != null && { tenantSignedIp: ip }),
        ...(userAgent != null && { tenantSignedUserAgent: userAgent }),
      },
    });
    if (r.count === 0) return null;
    const updated = await prisma.contract.findUnique({ where: { id: contractId } });
    return updated ? toContract(updated) : null;
  },

  async setOwnerSignedAt(contractId: string, signedAt: Date, ip?: string | null, userAgent?: string | null): Promise<Contract | null> {
    const r = await prisma.contract.updateMany({
      where: { id: contractId },
      data: {
        ownerSignedAt: signedAt,
        ...(ip != null && { ownerSignedIp: ip }),
        ...(userAgent != null && { ownerSignedUserAgent: userAgent }),
      },
    });
    if (r.count === 0) return null;
    const updated = await prisma.contract.findUnique({ where: { id: contractId } });
    return updated ? toContract(updated) : null;
  },

  async updateStatus(contractId: string, status: Contract["status"]): Promise<Contract | null> {
    const r = await prisma.contract.updateMany({
      where: { id: contractId },
      data: { status },
    });
    if (r.count === 0) return null;
    const updated = await prisma.contract.findUnique({ where: { id: contractId } });
    return updated ? toContract(updated) : null;
  },
};
