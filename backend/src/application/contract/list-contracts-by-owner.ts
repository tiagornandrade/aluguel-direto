import type { IContractRepository, ContractWithDetailsForOwner } from "../../domains/contract/repositories/IContractRepository";

export async function listContractsByOwner(
  repo: IContractRepository,
  ownerId: string
): Promise<{ contracts: ContractWithDetailsForOwner[] }> {
  const contracts = await repo.findByOwner(ownerId);
  return { contracts };
}
