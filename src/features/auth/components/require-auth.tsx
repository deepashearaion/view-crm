import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { paths } from '@/routes/paths';

import { hasValidSession } from '../api/session';

/** Redirects to sign-in (remembering the target) when there is no valid session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!hasValidSession()) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${paths.signIn}?redirect=${redirect}`} replace />;
  }
  return children;
}
