import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";
import type { Contract } from "../../domains/contract/entities/Contract";

export interface SignContractContext {
  ip?: string | null;
  userAgent?: string | null;
  as?: "owner" | "tenant";
}

export async function signContract(
  repo: IContractRepository,
  userId: string,
  contractId: string,
  context?: SignContractContext
): Promise<{ contract: Contract }> {
  const detail = await repo.findById(contractId);
  if (!detail) throw new Error("NOT_FOUND");
  const { contract } = detail;
  const now = new Date();
  const ip = context?.ip ?? null;
  const userAgent = context?.userAgent ?? null;
  const asRole = context?.as;
  const isTenant = contract.tenantId === userId;
  const isOwner = contract.ownerId === userId;
  if (!isTenant && !isOwner) throw new Error("FORBIDDEN");
  let updated: Contract;
  if (asRole === "owner" && isOwner) {
    const result = await repo.setOwnerSignedAt(contractId, now, ip, userAgent);
    if (!result) throw new Error("NOT_FOUND");
    updated = result;
  } else if (asRole === "tenant" && isTenant) {
    const result = await repo.setTenantSignedAt(contractId, now, ip, userAgent);
    if (!result) throw new Error("NOT_FOUND");
    updated = result;
  } else if (isTenant && isOwner) {
    const result = asRole === "owner"
      ? await repo.setOwnerSignedAt(contractId, now, ip, userAgent)
      : await repo.setTenantSignedAt(contractId, now, ip, userAgent);
    if (!result) throw new Error("NOT_FOUND");
    updated = result;
  } else if (isTenant) {
    const result = await repo.setTenantSignedAt(contractId, now, ip, userAgent);
    if (!result) throw new Error("NOT_FOUND");
    updated = result;
  } else {
    const result = await repo.setOwnerSignedAt(contractId, now, ip, userAgent);
    if (!result) throw new Error("NOT_FOUND");
    updated = result;
  }
  if (updated.ownerSignedAt && updated.tenantSignedAt) {
    const activated = await repo.updateStatus(contractId, "ATIVO");
    return { contract: activated ?? updated };
  }
  return { contract: updated };
}
