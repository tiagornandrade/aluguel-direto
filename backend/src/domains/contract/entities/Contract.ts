export type ContractStatus = "PENDENTE_ASSINATURA" | "ATIVO" | "ENCERRADO";

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  chargesAmount: number;
  dueDay: number;
  status: ContractStatus;
  paymentMethod: string | null;
  lateFeePercent: number | null;
  interestPercent: number | null;
  adjustmentIndex: string | null;
  guaranteeType: string | null;
  guaranteeAmount: number | null;
  foroComarca: string | null;
  contractCity: string | null;
  contractDate: Date | null;
  tenantSignedAt: Date | null;
  tenantSignedIp: string | null;
  tenantSignedUserAgent: string | null;
  ownerSignedAt: Date | null;
  ownerSignedIp: string | null;
  ownerSignedUserAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}
