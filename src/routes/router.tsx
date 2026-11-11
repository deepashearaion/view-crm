import {
  createBrowserRouter,
  Navigate,
  Outlet,
  redirect,
  type RouteObject,
} from 'react-router-dom';

import { PageSkeleton } from '@/components/feedback/page-skeleton';
import { RouteError } from '@/components/feedback/route-error';
import { authRoutes, hasValidSession, RequireAuth } from '@/features/auth';
import { automationRoutes } from '@/features/automation';
import { companiesRoutes } from '@/features/companies';
import { contactsRoutes } from '@/features/contacts';
import { dashboardRoutes } from '@/features/dashboard';
import { dealsRoutes } from '@/features/deals';
import { extrasRoutes } from '@/features/extras';
import { importRoutes } from '@/features/import';
import { leadsRoutes } from '@/features/leads';
import { nurtureRoutes, unsubscribeRoutes } from '@/features/nurture';
import { onboardingRoutes } from '@/features/onboarding';
import { productsRoutes } from '@/features/products';
import { reportsRoutes } from '@/features/reports';
import { settingsRoutes } from '@/features/settings';
import { tasksRoutes } from '@/features/tasks';
import { AppShell } from '@/layouts/app-shell';
import { crumb } from '@/types';

import { paths } from './paths';

/** Children of /dashboard, grouped by workflow stage. */
const appRoutes: RouteObject[] = [
  { index: true, element: <Navigate to={paths.home} replace /> },
  ...dashboardRoutes,

  // Leads
  ...leadsRoutes,
  ...contactsRoutes,
  ...companiesRoutes,
  ...importRoutes,

  // Nurture
  ...nurtureRoutes,

  // Deals
  ...dealsRoutes,
  ...tasksRoutes,

  // Onboarding
  ...onboardingRoutes,
  ...productsRoutes,

  // Reports
  ...reportsRoutes,

  // Workspace extras
  ...extrasRoutes,

  ...automationRoutes,
  ...settingsRoutes,
];

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageSkeleton />,
    children: [
      {
        path: '/',
        loader: () => redirect(hasValidSession() ? paths.dashboard : paths.signIn),
      },
      // Paths the backend puts in emails and notification links (no /dashboard prefix).
      { path: '/reports', loader: () => redirect(paths.reports) },
      {
        path: '/contacts/:id',
        loader: ({ params }) => redirect(`${paths.contacts}/${params.id ?? ''}`),
      },
      {
        path: '/tasks/:id',
        loader: ({ params }) => redirect(`${paths.tasks}/${params.id ?? ''}`),
      },
      ...authRoutes,
      // Public: the link in nurture email footers.
      ...unsubscribeRoutes,
      {
        path: paths.dashboard,
        handle: crumb('Dashboard'),
        element: (
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        ),
        children: [{ errorElement: <RouteError />, children: appRoutes }],
      },
    ],
  },
]);
