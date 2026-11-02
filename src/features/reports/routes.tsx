import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. */
export const reportsRoutes: RouteObject[] = [
  {
    path: 'reports',
    handle: crumb('Reports'),
    lazy: () => import('./pages/reports-page').then((m) => ({ Component: m.default })),
  },
];
