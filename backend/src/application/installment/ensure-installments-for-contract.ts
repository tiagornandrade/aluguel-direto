import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";
import type { IInstallmentRepository } from "../../domains/installment/repositories/IInstallmentRepository";

/** Ensure an installment exists for the given month/year if the contract is active in that period. */
export async function ensureInstallmentForMonth(
  contractRepo: IContractRepository,
  installmentRepo: IInstallmentRepository,
  contractId: string,
  referenceMonth: number,
  referenceYear: number
): Promise<void> {
  const detail = await contractRepo.findById(contractId);
  if (!detail) return;
  const { contract } = detail;
  if (contract.status !== "ATIVO") return;

  const dueDay = Math.min(Math.max(1, contract.dueDay), 28);
  const dueDate = new Date(referenceYear, referenceMonth - 1, dueDay);
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  if (dueDate < start || dueDate > end) return;

  const existing = await installmentRepo.findByContractAndMonth(contractId, referenceMonth, referenceYear);
  if (existing) return;

  const amount = contract.rentAmount + (contract.chargesAmount ?? 0);
  await installmentRepo.create({
    contractId,
    referenceMonth,
    referenceYear,
    amount,
    dueDate,
  });
}

/** Ensure installments exist for the current and next month for an active contract. */
export async function ensureInstallmentsForContract(
  contractRepo: IContractRepository,
  installmentRepo: IInstallmentRepository,
  contractId: string
): Promise<void> {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const nextMonth = thisMonth === 12 ? 1 : thisMonth + 1;
  const nextYear = thisMonth === 12 ? thisYear + 1 : thisYear;
  await ensureInstallmentForMonth(contractRepo, installmentRepo, contractId, thisMonth, thisYear);
  await ensureInstallmentForMonth(contractRepo, installmentRepo, contractId, nextMonth, nextYear);
}
