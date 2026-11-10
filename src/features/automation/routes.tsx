import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. The active tab is the `?tab=` search param. */
export const automationRoutes: RouteObject[] = [
  {
    path: 'automation',
    handle: crumb('Automation'),
    lazy: () =>
      import('./pages/automation-page').then(({ default: AutomationPage }) => ({
        Component: AutomationPage,
      })),
  },
];
