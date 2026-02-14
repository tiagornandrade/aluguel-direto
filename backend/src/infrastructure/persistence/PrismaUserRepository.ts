import { prisma } from "../../lib/db";
import type { IUserRepository, CreateUserInput, UpdateUserProfileInput } from "../../domains/identity/repositories/IUserRepository";
import type { User, UserPersisted } from "../../domains/identity/entities/User";

function toUser(r: {
  id: string; email: string; fullName: string; cpf: string | null; rg: string | null;
  nacionalidade: string | null; estadoCivil: string | null; profissao: string | null; endereco: string | null;
  role: string; profileCompleted: boolean; createdAt: Date; updatedAt: Date;
}): User {
  return {
    id: r.id,
    email: r.email,
    fullName: r.fullName,
    cpf: r.cpf,
    rg: r.rg ?? null,
    nacionalidade: r.nacionalidade ?? null,
    estadoCivil: r.estadoCivil ?? null,
    profissao: r.profissao ?? null,
    endereco: r.endereco ?? null,
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
        cpf: data.cpf ?? null,
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

  async update(id: string, data: UpdateUserProfileInput): Promise<User> {
    const r = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName != null && { fullName: data.fullName }),
        ...(data.cpf !== undefined && { cpf: data.cpf }),
        ...(data.rg !== undefined && { rg: data.rg }),
        ...(data.nacionalidade !== undefined && { nacionalidade: data.nacionalidade }),
        ...(data.estadoCivil !== undefined && { estadoCivil: data.estadoCivil }),
        ...(data.profissao !== undefined && { profissao: data.profissao }),
        ...(data.endereco !== undefined && { endereco: data.endereco }),
      },
    });
    return toUser(r);
  },
};
