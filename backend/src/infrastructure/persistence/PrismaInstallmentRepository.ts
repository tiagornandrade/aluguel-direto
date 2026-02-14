import { prisma } from "../../lib/db";
import type { IInstallmentRepository } from "../../domains/installment/repositories/IInstallmentRepository";
import type { RentInstallment } from "../../domains/installment/entities/RentInstallment";

function toInstallment(r: {
  id: string;
  contractId: string;
  referenceMonth: number;
  referenceYear: number;
  amount: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): RentInstallment {
  return {
    id: r.id,
    contractId: r.contractId,
    referenceMonth: r.referenceMonth,
    referenceYear: r.referenceYear,
    amount: r.amount,
    dueDate: r.dueDate,
    status: r.status as RentInstallment["status"],
    paidAt: r.paidAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const PrismaInstallmentRepository: IInstallmentRepository = {
  async findByContract(contractId: string) {
    const list = await prisma.rentInstallment.findMany({
      where: { contractId },
      orderBy: [{ referenceYear: "asc" }, { referenceMonth: "asc" }],
    });
    return list.map(toInstallment);
  },

  async findByContractAndMonth(contractId: string, month: number, year: number) {
    const r = await prisma.rentInstallment.findUnique({
      where: {
        contractId_referenceMonth_referenceYear: { contractId, referenceMonth: month, referenceYear: year },
      },
    });
    return r ? toInstallment(r) : null;
  },

  async create(data) {
    const r = await prisma.rentInstallment.create({
      data: {
        contractId: data.contractId,
        referenceMonth: data.referenceMonth,
        referenceYear: data.referenceYear,
        amount: data.amount,
        dueDate: data.dueDate,
        status: "PENDENTE",
      },
    });
    return toInstallment(r);
  },

  async markPaid(id: string, paidAt: Date) {
    const r = await prisma.rentInstallment.update({
      where: { id },
      data: { status: "PAGO", paidAt },
    }).catch(() => null);
    return r ? toInstallment(r) : null;
  },

  async findById(id: string) {
    const r = await prisma.rentInstallment.findUnique({ where: { id } });
    return r ? toInstallment(r) : null;
  },
};
