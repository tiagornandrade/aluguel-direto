export type UserRole = "PROPRIETARIO" | "INQUILINO";

export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string | null;
  role: UserRole;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPersisted extends User {
  passwordHash: string;
}
