import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

const invoicePage = (create: boolean) => () =>
  import('./pages/invoice-page').then(({ default: InvoicePage }) => ({
    Component: () => <InvoicePage create={create} />,
  }));

/** Mounted under /dashboard. */
export const onboardingRoutes: RouteObject[] = [
  {
    path: 'onboarding',
    handle: crumb('Onboarding'),
    lazy: () => import('./pages/onboarding-page').then((m) => ({ Component: m.default })),
  },
  {
    path: 'invoices',
    handle: crumb('Invoices'),
    children: [
      {
        index: true,
        lazy: () => import('./pages/invoices-page').then((m) => ({ Component: m.default })),
      },
      { path: 'new', handle: crumb('New invoice'), lazy: invoicePage(true) },
      {
        path: 'settings',
        handle: crumb('Billing profile'),
        lazy: () => import('./pages/billing-profile-page').then((m) => ({ Component: m.default })),
      },
      // Drafts open in the editor; issued and cancelled invoices read-only.
      { path: ':invoiceId', handle: crumb('Invoice'), lazy: invoicePage(false) },
    ],
  },
];
