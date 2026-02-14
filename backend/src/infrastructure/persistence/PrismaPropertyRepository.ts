import { prisma } from "../../lib/db";
import type { IPropertyRepository, CreatePropertyInput, UpdatePropertyInput } from "../../domains/property/repositories/IPropertyRepository";
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
  photos: string[];
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
    photos: r.photos ?? [],
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
        photos: data.photos ?? [],
      },
    });
    return toProperty(r);
  },

  async update(id: string, data: UpdatePropertyInput): Promise<Property> {
    const r = await prisma.property.update({
      where: { id },
      data: {
        ...(data.title != null && { title: data.title }),
        ...(data.addressLine != null && { addressLine: data.addressLine }),
        ...(data.type != null && { type: data.type }),
        ...(data.areaM2 !== undefined && { areaM2: data.areaM2 }),
        ...(data.rooms !== undefined && { rooms: data.rooms }),
        ...(data.parkingSpots !== undefined && { parkingSpots: data.parkingSpots }),
        ...(data.rentAmount !== undefined && { rentAmount: data.rentAmount }),
        ...(data.chargesAmount !== undefined && { chargesAmount: data.chargesAmount }),
        ...(data.status != null && { status: data.status }),
        ...(data.photos !== undefined && { photos: data.photos }),
      },
    });
    return toProperty(r);
  },

  async delete(id: string): Promise<void> {
    await prisma.property.delete({ where: { id } });
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

  async findAvailable(): Promise<Property[]> {
    const list = await prisma.property.findMany({
      where: { status: { in: ["DISPONIVEL", "EM_NEGOCIACAO"] } },
      orderBy: { createdAt: "desc" },
    });
    return list.map(toProperty);
  },

  async findAvailableById(id: string): Promise<Property | null> {
    const r = await prisma.property.findFirst({
      where: { id, status: { in: ["DISPONIVEL", "EM_NEGOCIACAO"] } },
    });
    return r ? toProperty(r) : null;
  },

  async findAvailableByIdWithOwner(id: string): Promise<(Property & { ownerEmail: string; ownerFullName: string }) | null> {
    const r = await prisma.property.findFirst({
      where: { id, status: { in: ["DISPONIVEL", "EM_NEGOCIACAO"] } },
      include: { owner: { select: { email: true, fullName: true } } },
    });
    if (!r) return null;
    return {
      ...toProperty(r),
      ownerEmail: r.owner.email,
      ownerFullName: r.owner.fullName,
    };
  },
};
