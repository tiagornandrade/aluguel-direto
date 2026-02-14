import type { IContractRepository, ContractDetail } from "../../domains/contract/repositories/IContractRepository";

export async function getContractById(
  repo: IContractRepository,
  userId: string,
  contractId: string
): Promise<ContractDetail> {
  const detail = await repo.findById(contractId);
  if (!detail) throw new Error("NOT_FOUND");
  const { contract } = detail;
  if (contract.ownerId !== userId && contract.tenantId !== userId) {
    throw new Error("FORBIDDEN");
  }
  return detail;
}
