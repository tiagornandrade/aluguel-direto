import type { IContractRepository, CreateContractInput } from "../../domains/contract/repositories/IContractRepository";
import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";
import type { Contract } from "../../domains/contract/entities/Contract";

export async function createContract(
  contractRepo: IContractRepository,
  propertyRepo: IPropertyRepository,
  ownerId: string,
  input: Omit<CreateContractInput, "ownerId">
): Promise<{ contract: Contract }> {
  const property = await propertyRepo.findById(input.propertyId);
  if (!property) throw new Error("NOT_FOUND");
  if (property.ownerId !== ownerId) throw new Error("FORBIDDEN");

  const contract = await contractRepo.create({
    ...input,
    ownerId,
  });

  await propertyRepo.update(input.propertyId, { status: "ALUGADO" });

  return { contract };
}
