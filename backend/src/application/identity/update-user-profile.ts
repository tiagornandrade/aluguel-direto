import type { IUserRepository, UpdateUserProfileInput } from "../../domains/identity/repositories/IUserRepository";
import type { User } from "../../domains/identity/entities/User";

export async function updateUserProfile(
  repo: IUserRepository,
  userId: string,
  data: UpdateUserProfileInput
): Promise<User> {
  return repo.update(userId, data);
}
