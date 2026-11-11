import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Mounted under /dashboard. Tabs: ?tab=users|roles. */
export const settingsRoutes: RouteObject[] = [
  {
    path: 'settings',
    handle: crumb('Settings'),
    lazy: () =>
      import('./pages/settings-page').then(({ default: SettingsPage }) => ({
        Component: SettingsPage,
      })),
  },
];
