import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. `?target=contacts|companies` selects what to import. */
export const importRoutes: RouteObject[] = [
  {
    path: 'import',
    handle: crumb('Bulk import'),
    lazy: () => import('./pages/import-page').then((m) => ({ Component: m.default })),
  },
];
