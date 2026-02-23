import type { INotificationRepository } from "../../domains/notification/repositories/INotificationRepository";
import type { IContractRepository } from "../../domains/contract/repositories/IContractRepository";
import type { Notification } from "../../domains/notification/entities/Notification";

export const TENANT_REQUEST_TYPES = ["PEDIDO_REPARO", "PEDIDO_TROCA", "PEDIDO_RESCISAO"] as const;
export type TenantRequestType = (typeof TENANT_REQUEST_TYPES)[number];

export async function createTenantRequest(
  notificationRepo: INotificationRepository,
  contractRepo: IContractRepository,
  input: { tenantId: string; contractId: string; type: TenantRequestType; message?: string | null }
): Promise<{ notification: Notification }> {
  const detail = await contractRepo.findById(input.contractId);
  if (!detail) throw new Error("NOT_FOUND");
  const { contract, owner } = detail;
  if (contract.tenantId !== input.tenantId) throw new Error("FORBIDDEN");
  if (!TENANT_REQUEST_TYPES.includes(input.type)) throw new Error("INVALID_TYPE");

  const recipientId = owner.id;
  const notification = await notificationRepo.create({
    recipientId,
    senderId: input.tenantId,
    type: input.type,
    propertyId: contract.propertyId,
    contractId: input.contractId,
    message: input.message ?? null,
  });
  return { notification };
}
