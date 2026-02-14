import type { IInstallmentRepository } from "../../domains/installment/repositories/IInstallmentRepository";
import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";
import type { RentInstallment } from "../../domains/installment/entities/RentInstallment";

export interface InstallmentDetail {
  installment: RentInstallment;
  contract: { id: string; dueDay: number; paymentMethod: string | null };
  property: { id: string; title: string; addressLine: string };
  tenant: { id: string; fullName: string };
  owner: { id: string; fullName: string };
}

export async function getInstallmentById(
  contractRepo: IContractRepository,
  installmentRepo: IInstallmentRepository,
  userId: string,
  installmentId: string
): Promise<InstallmentDetail> {
  const installment = await installmentRepo.findById(installmentId);
  if (!installment) throw new Error("NOT_FOUND");
  const detail = await contractRepo.findById(installment.contractId);
  if (!detail) throw new Error("NOT_FOUND");
  if (detail.contract.ownerId !== userId && detail.contract.tenantId !== userId) {
    throw new Error("FORBIDDEN");
  }
  return {
    installment,
    contract: { id: detail.contract.id, dueDay: detail.contract.dueDay, paymentMethod: detail.contract.paymentMethod ?? null },
    property: detail.property,
    tenant: { id: detail.tenant.id, fullName: detail.tenant.fullName },
    owner: { id: detail.owner.id, fullName: detail.owner.fullName },
  };
}
