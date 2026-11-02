import { http } from '@/services';

import type { User } from '../types';

/** GET /api/users → { users } (team members who can own records). */
export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await http.get<{ users: User[] }>('/api/users', { signal });
  return response.users;
}
