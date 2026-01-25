import type { IUserRepository } from "../../domains/identity/repositories/IUserRepository";
import type { User } from "../../domains/identity/entities/User";

export interface RegisterUserInput {
  email: string;
  fullName: string;
  cpf: string | null;
  password: string;
  role: "PROPRIETARIO" | "INQUILINO";
}

export interface RegisterUserResult {
  user: User;
}

export async function registerUser(
  repo: IUserRepository,
  hash: (plain: string) => Promise<string>,
  input: RegisterUserInput
): Promise<RegisterUserResult> {
  const existing = await repo.findByEmail(input.email.trim().toLowerCase());
  if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

  const passwordHash = await hash(input.password);
  const user = await repo.create({
    email: input.email.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    cpf: input.cpf?.trim() || null,
    passwordHash,
    role: input.role,
  });
  return { user };
}
