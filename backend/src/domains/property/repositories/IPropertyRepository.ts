import type { Property } from "../entities/Property";

export interface CreatePropertyInput {
  ownerId: string;
  title: string;
  addressLine: string;
  type: Property["type"];
  areaM2?: number | null;
  rooms?: number | null;
  parkingSpots?: number | null;
  rentAmount?: number | null;
  chargesAmount?: number | null;
}

export interface IPropertyRepository {
  create(data: CreatePropertyInput): Promise<Property>;
  findById(id: string): Promise<Property | null>;
  findByOwner(ownerId: string): Promise<Property[]>;
}
