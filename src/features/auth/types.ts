import type { z } from 'zod';

import type { sessionUserSchema } from './schemas';

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const USER_ROLES = ['admin', 'manager', 'rep'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
