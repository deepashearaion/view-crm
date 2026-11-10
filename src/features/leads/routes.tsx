import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. */
export const leadsRoutes: RouteObject[] = [
  {
    path: 'leads',
    handle: crumb('Leads'),
    lazy: () =>
      import('./pages/leads-page').then(({ default: LeadsPage }) => ({ Component: LeadsPage })),
  },
];
