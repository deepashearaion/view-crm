import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. */
export const dealsRoutes: RouteObject[] = [
  {
    path: 'deals',
    handle: crumb('Pipeline'),
    lazy: () => import('./pages/pipeline-page').then((m) => ({ Component: m.default })),
  },
  {
    path: 'quotations',
    handle: crumb('Quotations'),
    lazy: () => import('./pages/quotations-page').then((m) => ({ Component: m.default })),
  },
];
