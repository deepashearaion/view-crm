import type { ComponentType } from 'react';
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
import { dealsRoutes } from '@/features/deals';
import { importRoutes } from '@/features/import';
import { tasksRoutes } from '@/features/tasks';
import { AppShell } from '@/layouts/app-shell';
import { crumb } from '@/types';

import { useLegacyNavigate, type LegacyNavigate } from './legacy';
import { ModulePlaceholder } from './module-placeholder';
import { paths } from './paths';

interface LegacyPageProps {
  setCurrentPage: LegacyNavigate;
  [prop: string]: unknown;
}

/**
 * Lazily mounts an untyped legacy .jsx page inside the new shell, wiring its
 * `setCurrentPage` prop to the router. Removed as each page migrates in Phase 2.
 */
function legacyPage(
  load: () => Promise<{ default: unknown }>,
  props: Record<string, unknown> | (() => Record<string, unknown>) = {},
): RouteObject['lazy'] {
  return async () => {
    const Page = (await load()).default as ComponentType<LegacyPageProps>;
    function LegacyRoute() {
      const setCurrentPage = useLegacyNavigate();
      const extra = typeof props === 'function' ? props() : props;
      return <Page setCurrentPage={setCurrentPage} {...extra} />;
    }
    return { Component: LegacyRoute };
  };
}

const dashboardRoutes: RouteObject[] = [
  { index: true, element: <Navigate to={paths.home} replace /> },
  { path: 'home', handle: crumb('Home'), lazy: legacyPage(() => import('@/pages/Home')) },

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
  {
    path: 'invoices',
    handle: crumb('Invoices'),
    lazy: legacyPage(() => import('@/pages/Invoice')),
  },
  {
    path: 'products',
    handle: crumb('Products & services'),
    lazy: legacyPage(() => import('@/pages/ProductsServices')),
  },

  // Reports
  { path: 'reports', handle: crumb('Reports'), lazy: legacyPage(() => import('@/pages/Reports')) },

  // Workspace extras
  {
    path: 'attendance',
    handle: crumb('Attendance'),
    lazy: legacyPage(() => import('@/pages/Attendance')),
  },
  {
    path: 'files',
    handle: crumb('File cabinet'),
    lazy: legacyPage(() => import('@/pages/FileCabinet')),
  },
  {
    path: 'call-recordings',
    handle: crumb('Call recordings'),
    lazy: legacyPage(() => import('@/pages/CallRecordings')),
  },

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
        children: [{ errorElement: <RouteError />, children: dashboardRoutes }],
      },
    ],
  },
]);
