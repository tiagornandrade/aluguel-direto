import type { IInstallmentRepository } from "../../domains/installment/repositories/IInstallmentRepository";
import type { RentInstallment } from "../../domains/installment/entities/RentInstallment";
import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";

export async function markInstallmentPaid(
  contractRepo: IContractRepository,
  installmentRepo: IInstallmentRepository,
  userId: string,
  installmentId: string
): Promise<{ installment: RentInstallment }> {
  const installment = await installmentRepo.findById(installmentId);
  if (!installment) throw new Error("NOT_FOUND");
  const detail = await contractRepo.findById(installment.contractId);
  if (!detail) throw new Error("NOT_FOUND");
  if (detail.contract.ownerId !== userId) throw new Error("FORBIDDEN");
  if (installment.status === "PAGO") return { installment };

  const updated = await installmentRepo.markPaid(installmentId, new Date());
  if (!updated) throw new Error("NOT_FOUND");
  return { installment: updated };
}
