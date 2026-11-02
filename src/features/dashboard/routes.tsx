import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. */
export const dashboardRoutes: RouteObject[] = [
  {
    path: 'home',
    handle: crumb('Home'),
    lazy: () => import('./pages/dashboard-page').then((m) => ({ Component: m.default })),
  },
];
