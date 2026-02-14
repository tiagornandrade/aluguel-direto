import type { IContractRepository, ContractWithDetailsForOwner } from "../../domains/contract/repositories/IContractRepository";
import type { IInstallmentRepository } from "../../domains/installment/repositories/IInstallmentRepository";
import type { RentInstallment } from "../../domains/installment/entities/RentInstallment";
import { ensureInstallmentsForContract } from "./ensure-installments-for-contract";

export interface InstallmentForOwner {
  installment: RentInstallment;
  contract: { id: string; dueDay: number; paymentMethod: string | null };
  property: { id: string; title: string; addressLine: string };
  tenant: { id: string; fullName: string };
}

export async function listInstallmentsByOwner(
  contractRepo: IContractRepository,
  installmentRepo: IInstallmentRepository,
  ownerId: string
): Promise<{ installments: InstallmentForOwner[] }> {
  const contracts = await contractRepo.findByOwner(ownerId);
  const active = contracts.filter((c: ContractWithDetailsForOwner) => c.contract.status === "ATIVO");
  for (const c of active) {
    await ensureInstallmentsForContract(contractRepo, installmentRepo, c.contract.id);
  }
  const results: InstallmentForOwner[] = [];
  for (const c of contracts) {
    const list = await installmentRepo.findByContract(c.contract.id);
    for (const inst of list) {
      results.push({
        installment: inst,
        contract: { id: c.contract.id, dueDay: c.contract.dueDay, paymentMethod: c.contract.paymentMethod ?? null },
        property: c.property,
        tenant: c.tenant,
      });
    }
  }
  results.sort((a, b) => a.installment.dueDate.getTime() - b.installment.dueDate.getTime());
  return { installments: results };
}
