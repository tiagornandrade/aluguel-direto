import type { RentInstallment } from "../entities/RentInstallment";

export interface InstallmentWithContract {
  installment: RentInstallment;
  contract: { id: string; dueDay: number; paymentMethod: string | null };
  property?: { id: string; title: string; addressLine: string };
  tenant?: { id: string; fullName: string };
  owner?: { id: string; fullName: string };
}

export interface IInstallmentRepository {
  findByContract(contractId: string): Promise<RentInstallment[]>;
  findByContractAndMonth(contractId: string, month: number, year: number): Promise<RentInstallment | null>;
  create(data: {
    contractId: string;
    referenceMonth: number;
    referenceYear: number;
    amount: number;
    dueDate: Date;
  }): Promise<RentInstallment>;
  markPaid(id: string, paidAt: Date): Promise<RentInstallment | null>;
  findById(id: string): Promise<RentInstallment | null>;
}
