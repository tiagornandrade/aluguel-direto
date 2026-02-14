export type RentInstallmentStatus = "PENDENTE" | "PAGO" | "ATRASADO";

export interface RentInstallment {
  id: string;
  contractId: string;
  referenceMonth: number;
  referenceYear: number;
  amount: number;
  dueDate: Date;
  status: RentInstallmentStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
