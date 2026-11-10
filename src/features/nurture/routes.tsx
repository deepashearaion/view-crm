import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

const nurturePage = (createOnMount: boolean) => () =>
  import('./pages/nurture-page').then(({ default: NurturePage }) => ({
    Component: () => <NurturePage createOnMount={createOnMount} />,
  }));

/** Mounted under /dashboard. Edit a sequence with ?sequence={id}. */
export const nurtureRoutes: RouteObject[] = [
  {
    path: 'nurture',
    handle: crumb('Sequences'),
    children: [
      { index: true, lazy: nurturePage(false) },
      { path: 'new', handle: crumb('New sequence'), lazy: nurturePage(true) },
    ],
  },
];

/** Public, top level: no sign-in required. */
export const unsubscribeRoutes: RouteObject[] = [
  {
    path: '/unsubscribe',
    lazy: () =>
      import('./pages/unsubscribe-page').then(({ default: UnsubscribePage }) => ({
        Component: UnsubscribePage,
      })),
  },
];
