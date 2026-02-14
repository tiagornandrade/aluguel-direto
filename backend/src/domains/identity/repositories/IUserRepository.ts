import type { User, UserPersisted } from "../entities/User";

export interface CreateUserInput {
  email: string;
  fullName: string;
  cpf?: string | null;
  passwordHash: string;
  role: "PROPRIETARIO" | "INQUILINO";
}

export interface UpdateUserProfileInput {
  fullName?: string;
  cpf?: string | null;
  rg?: string | null;
  nacionalidade?: string | null;
  estadoCivil?: string | null;
  profissao?: string | null;
  endereco?: string | null;
}

export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<UserPersisted | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserProfileInput): Promise<User>;
}
