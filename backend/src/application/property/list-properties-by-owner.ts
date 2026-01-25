import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";
import type { Property } from "../../domains/property/entities/Property";

export async function listPropertiesByOwner(repo: IPropertyRepository, ownerId: string): Promise<{ properties: Property[] }> {
  const properties = await repo.findByOwner(ownerId);
  return { properties };
}
