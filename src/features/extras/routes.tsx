import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

/** Workspace extras, mounted under /dashboard. */
export const extrasRoutes: RouteObject[] = [
  {
    path: 'attendance',
    handle: crumb('Attendance'),
    lazy: () =>
      import('./attendance/pages/attendance-page').then((m) => ({ Component: m.default })),
  },
  {
    path: 'files',
    handle: crumb('File cabinet'),
    lazy: () =>
      import('./file-cabinet/pages/file-cabinet-page').then((m) => ({ Component: m.default })),
  },
  {
    path: 'call-recordings',
    handle: crumb('Call recordings'),
    lazy: () =>
      import('./call-recordings/pages/call-recordings-page').then((m) => ({
        Component: m.default,
      })),
  },
];
