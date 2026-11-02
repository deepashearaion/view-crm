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
import { companiesRoutes } from '@/features/companies';
import { contactsRoutes } from '@/features/contacts';
import { dashboardRoutes } from '@/features/dashboard';
import { dealsRoutes } from '@/features/deals';
import { extrasRoutes } from '@/features/extras';
import { importRoutes } from '@/features/import';
import { onboardingRoutes } from '@/features/onboarding';
import { productsRoutes } from '@/features/products';
import { reportsRoutes } from '@/features/reports';
import { tasksRoutes } from '@/features/tasks';
import { AppShell } from '@/layouts/app-shell';
import { crumb } from '@/types';

import { ModulePlaceholder } from './module-placeholder';
import { paths } from './paths';

/** Children of /dashboard, grouped by workflow stage. */
const appRoutes: RouteObject[] = [
  { index: true, element: <Navigate to={paths.home} replace /> },
  ...dashboardRoutes,

  // Leads
  {
    path: 'leads',
    handle: crumb('Leads'),
    element: (
      <ModulePlaceholder
        title="Leads"
        description="Captured from WhatsApp, web forms and email, then scored and routed by AI."
        phase={3}
        workflow="ai"
      />
    ),
  },
  ...contactsRoutes,
  ...companiesRoutes,
  ...importRoutes,

  // Nurture
  {
    path: 'nurture',
    handle: crumb('Sequences'),
    element: (
      <ModulePlaceholder
        title="Nurture sequences"
        description="Automatic email and WhatsApp cadences; replies re-score the lead."
        phase={4}
        workflow="ai"
      />
    ),
  },

  // Deals
  ...dealsRoutes,
  ...tasksRoutes,

  // Onboarding
  {
    path: 'onboarding',
    handle: crumb('Onboarding'),
    element: (
      <ModulePlaceholder
        title="Onboarding"
        description="Won deals automatically receive a welcome message and invoice."
        phase={5}
        workflow="ai"
      />
    ),
  },
  ...onboardingRoutes,
  ...productsRoutes,

  // Reports
  ...reportsRoutes,

  // Workspace extras
  ...extrasRoutes,

  {
    path: 'automation',
    handle: crumb('Automation'),
    element: (
      <ModulePlaceholder
        title="Automation"
        description="Scoring rules, owner routing and default nurture cadences."
        phase={5}
        workflow="ai"
      />
    ),
  },
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
      ...authRoutes,
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
