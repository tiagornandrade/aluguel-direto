export type PropertyType = "APARTAMENTO" | "CASA" | "STUDIO" | "COBERTURA";
export type PropertyStatus = "DISPONIVEL" | "EM_NEGOCIACAO" | "ALUGADO" | "ENCERRADO";

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  addressLine: string;
  type: PropertyType;
  areaM2: number | null;
  rooms: number | null;
  parkingSpots: number | null;
  rentAmount: number | null;
  chargesAmount: number | null;
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
}
