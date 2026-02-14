import type { IPropertyRepository } from "../../domains/property/repositories/IPropertyRepository";
import type { Property } from "../../domains/property/entities/Property";

export async function getAvailableProperty(repo: IPropertyRepository, id: string): Promise<Property | null> {
  return repo.findAvailableById(id);
}

export type AvailablePropertyWithOwner = Property & { ownerEmail: string; ownerFullName: string };

export async function getAvailablePropertyWithOwner(
  repo: IPropertyRepository,
  id: string
): Promise<AvailablePropertyWithOwner | null> {
  return repo.findAvailableByIdWithOwner(id);
}
