import type { RouteObject } from 'react-router-dom';

import { paths } from '@/routes/paths';

const signIn = () => import('./pages/sign-in-page').then((m) => ({ Component: m.default }));
const signUp = () => import('./pages/sign-up-page').then((m) => ({ Component: m.default }));
const forgotPassword = () =>
  import('./pages/forgot-password-page').then((m) => ({ Component: m.default }));

/** Public (unauthenticated) routes. */
export const authRoutes: RouteObject[] = [
  { path: paths.signIn, lazy: signIn },
  { path: paths.signUp, lazy: signUp },
  { path: paths.forgotPassword, lazy: forgotPassword },
  { path: paths.resetPassword, lazy: forgotPassword },
];
