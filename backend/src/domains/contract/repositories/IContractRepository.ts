import type { Contract } from "../entities/Contract";

export interface ContractWithDetails {
  contract: Contract;
  property: { id: string; title: string; addressLine: string; type: string };
  owner: { id: string; fullName: string };
}

export interface ContractWithDetailsForOwner {
  contract: Contract;
  property: { id: string; title: string; addressLine: string };
  tenant: { id: string; fullName: string };
}

export interface UserForContract {
  id: string;
  fullName: string;
  cpf: string | null;
  rg: string | null;
  nacionalidade: string | null;
  estadoCivil: string | null;
  profissao: string | null;
  endereco: string | null;
}

export interface ContractDetail {
  contract: Contract;
  property: { id: string; title: string; addressLine: string; type: string; areaM2: number | null };
  tenant: UserForContract;
  owner: UserForContract;
}

export interface CreateContractInput {
  propertyId: string;
  tenantId: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  chargesAmount?: number;
  dueDay: number;
  paymentMethod?: string | null;
  lateFeePercent?: number | null;
  interestPercent?: number | null;
  adjustmentIndex?: string | null;
  guaranteeType?: string | null;
  guaranteeAmount?: number | null;
  foroComarca?: string | null;
  contractCity?: string | null;
  contractDate?: Date | null;
}

export interface IContractRepository {
  create(data: CreateContractInput): Promise<Contract>;
  findByTenant(tenantId: string): Promise<ContractWithDetails[]>;
  findByOwner(ownerId: string): Promise<ContractWithDetailsForOwner[]>;
  findById(id: string): Promise<ContractDetail | null>;
  setTenantSignedAt(contractId: string, signedAt: Date, ip?: string | null, userAgent?: string | null): Promise<Contract | null>;
  setOwnerSignedAt(contractId: string, signedAt: Date, ip?: string | null, userAgent?: string | null): Promise<Contract | null>;
  updateStatus(contractId: string, status: Contract["status"]): Promise<Contract | null>;
}
