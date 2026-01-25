import type { IPropertyRepository, CreatePropertyInput } from "../../domains/property/repositories/IPropertyRepository";
import type { Property } from "../../domains/property/entities/Property";

export async function createProperty(repo: IPropertyRepository, input: CreatePropertyInput): Promise<{ property: Property }> {
  const property = await repo.create({
    ...input,
    areaM2: input.areaM2 ?? null,
    rooms: input.rooms ?? null,
    parkingSpots: input.parkingSpots ?? null,
    rentAmount: input.rentAmount ?? null,
    chargesAmount: input.chargesAmount ?? null,
  });
  return { property };
}
