import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. The onboarding workflow page itself arrives in Phase 5. */
export const onboardingRoutes: RouteObject[] = [
  {
    path: 'invoices',
    handle: crumb('Invoices'),
    lazy: () => import('./pages/invoices-page').then((m) => ({ Component: m.default })),
  },
];
