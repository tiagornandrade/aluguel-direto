import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";
import type { Property } from "../../domains/property/entities/Property";

export async function listAvailableProperties(repo: IPropertyRepository): Promise<{ properties: Property[] }> {
  const properties = await repo.findAvailable();
  return { properties };
}
