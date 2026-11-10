import { http } from '@/services';

import type { InviteUserRequest, User, UserDto, UserRole } from '../types';

export function toUser(dto: UserDto): User {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    role: dto.role,
    createdAt: dto.created_at,
  };
}

/** GET /api/v1/users → { users } (everyone in the org). */
export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await http.get<{ users: UserDto[] | null }>('/api/v1/users', { signal });
  return (response.users ?? []).map(toUser);
}

/** POST /api/v1/users (owner, admin). The invitee gets a set-password email. */
export async function inviteUser(body: InviteUserRequest): Promise<User> {
  const response = await http.post<{ user: UserDto }>('/api/v1/users', body);
  return toUser(response.user);
}

/** PATCH /api/v1/users/{id} (owner, admin). `409 last_owner` when removing the last owner. */
export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const response = await http.patch<{ user: UserDto }>(`/api/v1/users/${encodeURIComponent(id)}`, {
    role,
  });
  return toUser(response.user);
}
