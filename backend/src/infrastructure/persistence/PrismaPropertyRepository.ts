import { prisma } from "../../lib/db";
import type { IPropertyRepository, CreatePropertyInput } from "../../domains/property/repositories/IPropertyRepository";
import type { Property } from "../../domains/property/entities/Property";

function toProperty(r: {
  id: string;
  ownerId: string;
  title: string;
  addressLine: string;
  type: string;
  areaM2: number | null;
  rooms: number | null;
  parkingSpots: number | null;
  rentAmount: number | null;
  chargesAmount: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Property {
  return {
    id: r.id,
    ownerId: r.ownerId,
    title: r.title,
    addressLine: r.addressLine,
    type: r.type as Property["type"],
    areaM2: r.areaM2,
    rooms: r.rooms,
    parkingSpots: r.parkingSpots,
    rentAmount: r.rentAmount,
    chargesAmount: r.chargesAmount,
    status: r.status as Property["status"],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const PrismaPropertyRepository: IPropertyRepository = {
  async create(data: CreatePropertyInput) {
    const r = await prisma.property.create({
      data: {
        ownerId: data.ownerId,
        title: data.title,
        addressLine: data.addressLine,
        type: data.type,
        areaM2: data.areaM2 ?? null,
        rooms: data.rooms ?? null,
        parkingSpots: data.parkingSpots ?? null,
        rentAmount: data.rentAmount ?? null,
        chargesAmount: data.chargesAmount ?? null,
      },
    });
    return toProperty(r);
  },

  async findById(id: string): Promise<Property | null> {
    const r = await prisma.property.findUnique({ where: { id } });
    if (!r) return null;
    return toProperty(r);
  },

  async findByOwner(ownerId: string): Promise<Property[]> {
    const list = await prisma.property.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
    return list.map(toProperty);
  },
};
