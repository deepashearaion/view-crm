import {
  BarChart3,
  Bot,
  Building2,
  CalendarCheck,
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Package,
  PhoneCall,
  Receipt,
  Repeat,
  Rocket,
  Settings,
  SquareKanban,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { WorkflowKind } from '@/components/feedback/workflow-badge';
import type { PermissionAction, PermissionModule } from '@/features/auth';

import { paths, type AppPath } from './paths';

export interface NavItem {
  title: string;
  to: AppPath;
  icon: LucideIcon;
  /** Workflow legend type, shown as a badge for automated/human/decision modules. */
  workflow?: WorkflowKind;
  keywords?: string[];
}

export interface NavGroup {
  label: string;
  /** Icon for the collapsed rail; defaults to the first item's icon. */
  icon?: LucideIcon;
  items: NavItem[];
}

/** Sidebar navigation, grouped by workflow stage: Leads → Nurture → Deals → Onboarding → Reports. */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Home', to: paths.home, icon: LayoutDashboard, keywords: ['dashboard', 'sales'] },
    ],
  },
  {
    label: 'Leads',
    icon: Users,
    items: [
      {
        title: 'Leads',
        to: paths.leads,
        icon: Inbox,
        workflow: 'ai',
        keywords: ['capture', 'score'],
      },
      { title: 'Contacts', to: paths.contacts, icon: Users, keywords: ['people'] },
      { title: 'Companies', to: paths.companies, icon: Building2, keywords: ['accounts'] },
      { title: 'Bulk import', to: paths.import, icon: Upload, keywords: ['csv', 'excel'] },
    ],
  },
  {
    label: 'Nurture',
    items: [
      {
        title: 'Sequences',
        to: paths.nurture,
        icon: Repeat,
        workflow: 'ai',
        keywords: ['cadence', 'email', 'whatsapp'],
      },
    ],
  },
  {
    label: 'Deals',
    items: [
      {
        title: 'Pipeline',
        to: paths.deals,
        icon: SquareKanban,
        workflow: 'human',
        keywords: ['deals', 'kanban'],
      },
      { title: 'Tasks', to: paths.tasks, icon: ListChecks, keywords: ['activities', 'follow-up'] },
      { title: 'Quotations', to: paths.quotations, icon: FileText, keywords: ['quote'] },
    ],
  },
  {
    label: 'Onboarding',
    items: [
      {
        title: 'Onboarding',
        to: paths.onboarding,
        icon: Rocket,
        workflow: 'ai',
        keywords: ['welcome'],
      },
      { title: 'Invoices', to: paths.invoices, icon: Receipt, keywords: ['billing'] },
      { title: 'Products & services', to: paths.products, icon: Package, keywords: ['catalog'] },
    ],
  },
  {
    label: 'Reports',
    items: [{ title: 'Reports', to: paths.reports, icon: BarChart3, keywords: ['analytics'] }],
  },
  {
    label: 'Workspace',
    icon: FolderOpen,
    items: [
      { title: 'Attendance', to: paths.attendance, icon: CalendarCheck },
      { title: 'File cabinet', to: paths.files, icon: FolderOpen, keywords: ['documents'] },
      {
        title: 'Call recordings',
        to: paths.callRecordings,
        icon: PhoneCall,
        keywords: ['calls', 'logs'],
      },
    ],
  },
];

export const settingsNav: NavItem[] = [
  {
    title: 'Automation',
    to: paths.automation,
    icon: Bot,
    workflow: 'ai',
    keywords: ['scoring', 'routing', 'settings'],
  },
  {
    title: 'Settings',
    to: paths.settings,
    icon: Settings,
    keywords: ['users', 'roles', 'permissions', 'team', 'access'],
  },
];

export const allNavItems: NavItem[] = [
  ...navGroups.flatMap((group) => group.items),
  ...settingsNav,
];

export function isItemActive(item: NavItem, pathname: string) {
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

type NavRequirement = readonly [PermissionModule, PermissionAction];

/**
 * Permission needed to see a menu entry (any one of them). Entries not listed are shown to
 * everyone; modules without a backend permission (companies, products, extras) stay visible.
 */
const NAV_REQUIREMENTS: Partial<Record<AppPath, readonly NavRequirement[]>> = {
  [paths.leads]: [['contacts', 'view']],
  [paths.contacts]: [['contacts', 'view']],
  [paths.import]: [['contacts', 'create']],
  [paths.nurture]: [['nurture', 'view']],
  [paths.deals]: [['deals', 'view']],
  [paths.tasks]: [['tasks', 'view']],
  [paths.onboarding]: [['invoices', 'view']],
  [paths.invoices]: [['invoices', 'view']],
  [paths.reports]: [['reports', 'view']],
  [paths.automation]: [['settings', 'view']],
  [paths.settings]: [
    ['users', 'view'],
    ['roles', 'view'],
  ],
};

/** Menu entries the user may open; `can` comes from useAccess(). */
export function visibleNav(can: (module: PermissionModule, action: PermissionAction) => boolean): {
  groups: NavGroup[];
  settings: NavItem[];
} {
  const allowed = (item: NavItem) =>
    NAV_REQUIREMENTS[item.to]?.some(([module, action]) => can(module, action)) ?? true;
  return {
    groups: navGroups
      .map((group) => ({ ...group, items: group.items.filter(allowed) }))
      .filter((group) => group.items.length > 0),
    settings: settingsNav.filter(allowed),
  };
}
