import { db } from '../db';
import { mock } from '../router';

mock('GET', '/api/calls', () => ({ calls: db.calls }));
