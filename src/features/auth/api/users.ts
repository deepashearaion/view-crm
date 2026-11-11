import { http } from '@/services';

import type {
  CreateUserRequest,
  Me,
  MeDto,
  ModuleSpec,
  Role,
  RoleDto,
  RoleWriteRequest,
  User,
  UserDto,
} from '../types';

const path = (base: string, id: string, suffix = '') =>
  `${base}/${encodeURIComponent(id)}${suffix}`;

export function toUser(dto: UserDto): User {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    roleId: String(dto.role_id),
    roleName: dto.role_name,
    createdAt: dto.created_at,
  };
}

export function toRole(dto: RoleDto): Role {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description,
    locked: dto.locked,
    permissions: dto.permissions,
    userCount: dto.user_count,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

// ── Me and the permission catalog ────────────────────────────────────────────

/** GET /api/v1/me: the caller, their role and every permission they have. */
export async function fetchMe(signal?: AbortSignal): Promise<Me> {
  const dto = await http.get<MeDto>('/api/v1/me', { signal });
  return {
    user: toUser(dto.user),
    role: { id: String(dto.role.id), name: dto.role.name, locked: dto.role.locked },
    permissions: dto.permissions,
  };
}

/** GET /api/v1/permissions: every module, action and scope a role can grant. */
export async function fetchPermissionCatalog(signal?: AbortSignal): Promise<ModuleSpec[]> {
  const response = await http.get<{ modules: ModuleSpec[] }>('/api/v1/permissions', { signal });
  return response.modules;
}

// ── Users (users.view / users.create / users.edit) ───────────────────────────

export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await http.get<{ users: UserDto[] | null }>('/api/v1/users', { signal });
  return (response.users ?? []).map(toUser);
}

export async function createUser(body: CreateUserRequest): Promise<User> {
  const response = await http.post<{ user: UserDto }>('/api/v1/users', body);
  return toUser(response.user);
}

export async function renameUser(id: string, name: string): Promise<User> {
  const response = await http.patch<{ user: UserDto }>(path('/api/v1/users', id), { name });
  return toUser(response.user);
}

/** Takes effect on that user's next request. */
export async function assignUserRole(id: string, roleId: string): Promise<User> {
  const response = await http.put<{ user: UserDto }>(path('/api/v1/users', id, '/role'), {
    role_id: Number(roleId),
  });
  return toUser(response.user);
}

/** Signs that user out everywhere. */
export async function setUserPassword(id: string, password: string): Promise<void> {
  await http.put(path('/api/v1/users', id, '/password'), { password });
}

// ── Roles (roles.view / create / edit / delete) ──────────────────────────────

export async function fetchRoles(signal?: AbortSignal): Promise<Role[]> {
  const response = await http.get<{ roles: RoleDto[] | null }>('/api/v1/roles', { signal });
  return (response.roles ?? []).map(toRole);
}

export async function createRole(body: RoleWriteRequest): Promise<Role> {
  const response = await http.post<{ role: RoleDto }>('/api/v1/roles', body);
  return toRole(response.role);
}

/** `permissions` replaces the whole map. */
export async function updateRole(id: string, body: Partial<RoleWriteRequest>): Promise<Role> {
  const response = await http.patch<{ role: RoleDto }>(path('/api/v1/roles', id), body);
  return toRole(response.role);
}

export async function deleteRole(id: string): Promise<void> {
  await http.delete(path('/api/v1/roles', id));
}
