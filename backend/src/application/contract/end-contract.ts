import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";
import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";
import type { Contract } from "../../domains/contract/entities/Contract";

export async function endContract(
  contractRepo: IContractRepository,
  propertyRepo: IPropertyRepository,
  userId: string,
  contractId: string
): Promise<{ contract: Contract }> {
  const detail = await contractRepo.findById(contractId);
  if (!detail) throw new Error("NOT_FOUND");
  if (detail.contract.ownerId !== userId) throw new Error("FORBIDDEN");
  if (detail.contract.status === "ENCERRADO") throw new Error("ALREADY_ENDED");
  const updated = await contractRepo.updateStatus(contractId, "ENCERRADO");
  if (!updated) throw new Error("NOT_FOUND");
  await propertyRepo.update(detail.contract.propertyId, { status: "DISPONIVEL" });
  return { contract: updated };
}
