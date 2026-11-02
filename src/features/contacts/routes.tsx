import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

const contactsPage = (createOnMount: boolean) => () =>
  import('./pages/contacts-page').then(({ default: ContactsPage }) => ({
    Component: () => <ContactsPage createOnMount={createOnMount} />,
  }));

/** Mounted under /dashboard. */
export const contactsRoutes: RouteObject[] = [
  {
    path: 'contacts',
    handle: crumb('Contacts'),
    children: [
      { index: true, lazy: contactsPage(false) },
      { path: 'new', handle: crumb('New contact'), lazy: contactsPage(true) },
    ],
  },
];
