import type { IPropertyRepository, UpdatePropertyInput } from "../../domains/property/repositories/IPropertyRepository";
import type { Property } from "../../domains/property/entities/Property";

export async function updateProperty(
  repo: IPropertyRepository,
  id: string,
  data: UpdatePropertyInput
): Promise<Property> {
  return repo.update(id, data);
}
