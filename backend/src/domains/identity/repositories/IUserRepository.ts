import type { User, UserPersisted } from "../entities/User";

export interface CreateUserInput {
  email: string;
  fullName: string;
  cpf: string | null;
  passwordHash: string;
  role: "PROPRIETARIO" | "INQUILINO";
}

export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<UserPersisted | null>;
  findById(id: string): Promise<User | null>;
}
