import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

const companiesPage = (createOnMount: boolean) => () =>
  import('./pages/companies-page').then(({ default: CompaniesPage }) => ({
    Component: () => <CompaniesPage createOnMount={createOnMount} />,
  }));

/** Mounted under /dashboard. */
export const companiesRoutes: RouteObject[] = [
  {
    path: 'companies',
    handle: crumb('Companies'),
    children: [
      { index: true, lazy: companiesPage(false) },
      { path: 'new', handle: crumb('New company'), lazy: companiesPage(true) },
    ],
  },
];
