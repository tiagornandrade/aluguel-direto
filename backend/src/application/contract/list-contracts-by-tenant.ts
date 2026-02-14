import type { IContractRepository, ContractWithDetails } from "../../domains/contract/repositories/IContractRepository";

export async function listContractsByTenant(
  repo: IContractRepository,
  tenantId: string
): Promise<{ contracts: ContractWithDetails[] }> {
  const contracts = await repo.findByTenant(tenantId);
  return { contracts };
}
