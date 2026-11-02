import type { ReactNode } from 'react';

/*
 * Ported unchanged from App.jsx so Phase 1 does not change behaviour: it never blocks and
 * seeds a demo user when none is stored. Phase 2 (auth feature) replaces this with a real
 * token check that redirects to /signin.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ email: 'arun@dealconverter.com', name: 'Arun' }),
    );
  }
  return children;
}
