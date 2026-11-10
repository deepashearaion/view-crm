import type { UserRole } from './types';

/**
 * What each role may do, from the API's role table. Use these only to hide controls;
 * the server enforces every rule anyway.
 */
export const permissions = {
  /** Viewers are read-only. */
  canEdit: (role: UserRole | undefined) => role !== 'viewer',
  canReassign: (role: UserRole | undefined) =>
    role === 'owner' || role === 'admin' || role === 'manager',
  /** Sources, rules, stages, sequences, billing profile, report settings. */
  canManageSettings: (role: UserRole | undefined) =>
    role === 'owner' || role === 'admin' || role === 'manager',
  canManageUsers: (role: UserRole | undefined) => role === 'owner' || role === 'admin',
  /** GET /api/v1/reports/reps answers 403 for reps. */
  canSeeRepReport: (role: UserRole | undefined) => role !== 'rep',
};
