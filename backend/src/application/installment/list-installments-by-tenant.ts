import type { IContractRepository, ContractWithDetails } from "../../domains/contract/repositories/IContractRepository";
import type { IInstallmentRepository } from "../../domains/installment/repositories/IInstallmentRepository";
import type { RentInstallment } from "../../domains/installment/entities/RentInstallment";
import { ensureInstallmentsForContract } from "./ensure-installments-for-contract";

export interface InstallmentForTenant {
  installment: RentInstallment;
  contract: { id: string; dueDay: number; paymentMethod: string | null };
  property: { id: string; title: string; addressLine: string };
  owner: { id: string; fullName: string };
}

export async function listInstallmentsByTenant(
  contractRepo: IContractRepository,
  installmentRepo: IInstallmentRepository,
  tenantId: string
): Promise<{ installments: InstallmentForTenant[] }> {
  const contracts = await contractRepo.findByTenant(tenantId);
  const active = contracts.filter((c: ContractWithDetails) => c.contract.status === "ATIVO");
  for (const c of active) {
    await ensureInstallmentsForContract(contractRepo, installmentRepo, c.contract.id);
  }
  const results: InstallmentForTenant[] = [];
  for (const c of contracts) {
    const list = await installmentRepo.findByContract(c.contract.id);
    for (const inst of list) {
      results.push({
        installment: inst,
        contract: { id: c.contract.id, dueDay: c.contract.dueDay, paymentMethod: c.contract.paymentMethod ?? null },
        property: c.property,
        owner: c.owner,
      });
    }
  }
  results.sort((a, b) => a.installment.dueDate.getTime() - b.installment.dueDate.getTime());
  return { installments: results };
}
