import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";
import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";
import type { Notification } from "../../domains/notification/entities/Notification";

export const OWNER_TO_TENANT_TYPE = "SOLICITACAO_LOCADOR_TROCA" as const;

export async function createOwnerToTenantRequest(
  notificationRepo: INotificationRepository,
  contractRepo: IContractRepository,
  input: { ownerId: string; contractId: string; message?: string | null }
): Promise<{ notification: Notification }> {
  const detail = await contractRepo.findById(input.contractId);
  if (!detail) throw new Error("NOT_FOUND");
  const { contract } = detail;
  if (contract.ownerId !== input.ownerId) throw new Error("FORBIDDEN");

  const notification = await notificationRepo.create({
    recipientId: contract.tenantId,
    senderId: input.ownerId,
    type: OWNER_TO_TENANT_TYPE,
    propertyId: contract.propertyId,
    contractId: input.contractId,
    message: input.message ?? null,
  });
  return { notification };
}
