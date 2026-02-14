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

export interface UpdatePropertyInput {
  title?: string;
  addressLine?: string;
  type?: Property["type"];
  areaM2?: number | null;
  rooms?: number | null;
  parkingSpots?: number | null;
  rentAmount?: number | null;
  chargesAmount?: number | null;
  status?: Property["status"];
}

export interface IPropertyRepository {
  create(data: CreatePropertyInput): Promise<Property>;
  update(id: string, data: UpdatePropertyInput): Promise<Property>;
  findById(id: string): Promise<Property | null>;
  findByOwner(ownerId: string): Promise<Property[]>;
  findAvailable(): Promise<Property[]>;
  findAvailableById(id: string): Promise<Property | null>;
  findAvailableByIdWithOwner(id: string): Promise<(Property & { ownerEmail: string; ownerFullName: string }) | null>;
}
