import { prisma } from "../../lib/db";
import type { IUserRepository, CreateUserInput } from "../../domains/identity/repositories/IUserRepository";
import type { User, UserPersisted } from "../../domains/identity/entities/User";

function toUser(r: { id: string; email: string; fullName: string; cpf: string | null; role: string; profileCompleted: boolean; createdAt: Date; updatedAt: Date }): User {
  return {
    id: r.id,
    email: r.email,
    fullName: r.fullName,
    cpf: r.cpf,
    role: r.role as User["role"],
    profileCompleted: r.profileCompleted,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const PrismaUserRepository: IUserRepository = {
  async create(data: CreateUserInput) {
    const r = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        cpf: data.cpf,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
    return toUser(r);
  },

  async findByEmail(email: string): Promise<UserPersisted | null> {
    const r = await prisma.user.findUnique({ where: { email } });
    if (!r) return null;
    return { ...toUser(r), passwordHash: r.passwordHash };
  },

  async findById(id: string): Promise<User | null> {
    const r = await prisma.user.findUnique({ where: { id } });
    if (!r) return null;
    return toUser(r);
  },
};
