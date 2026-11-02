import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

const productsPage = (createOnMount: boolean) => () =>
  import('./pages/products-page').then(({ default: ProductsPage }) => ({
    Component: () => <ProductsPage createOnMount={createOnMount} />,
  }));

/** Mounted under /dashboard. */
export const productsRoutes: RouteObject[] = [
  {
    path: 'products',
    handle: crumb('Products & services'),
    children: [
      { index: true, lazy: productsPage(false) },
      { path: 'new', handle: crumb('New item'), lazy: productsPage(true) },
    ],
  },
];
