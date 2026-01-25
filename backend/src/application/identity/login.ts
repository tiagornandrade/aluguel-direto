import type { IUserRepository } from "../../domains/identity/repositories/IUserRepository";
import type { User } from "../../domains/identity/entities/User";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
}

export async function login(
  repo: IUserRepository,
  compare: (plain: string, hash: string) => Promise<boolean>,
  input: LoginInput
): Promise<LoginResult> {
  const found = await repo.findByEmail(input.email.trim().toLowerCase());
  if (!found) throw new Error("INVALID_CREDENTIALS");

  const ok = await compare(input.password, found.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const { passwordHash: _, ...user } = found;
  return { user };
}
