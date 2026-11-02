import type { User } from '@/features/auth';

import { db } from '../db';
import { mock } from '../router';

mock('GET', '/api/users', (): { users: User[] } => ({ users: db.users }));
