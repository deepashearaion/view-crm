export const paths = {
  signIn: '/signin',
  signUp: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  dashboard: '/dashboard',
  home: '/dashboard/home',

  // Leads stage
  leads: '/dashboard/leads',
  contacts: '/dashboard/contacts',
  contactsNew: '/dashboard/contacts/new',
  companies: '/dashboard/companies',
  companiesNew: '/dashboard/companies/new',
  import: '/dashboard/import',

  // Nurture stage
  nurture: '/dashboard/nurture',

  // Deals stage
  deals: '/dashboard/deals',
  tasks: '/dashboard/tasks',
  quotations: '/dashboard/quotations',

  // Onboarding stage
  onboarding: '/dashboard/onboarding',
  invoices: '/dashboard/invoices',
  products: '/dashboard/products',

  // Reports stage
  reports: '/dashboard/reports',

  // Workspace extras
  attendance: '/dashboard/attendance',
  files: '/dashboard/files',
  callRecordings: '/dashboard/call-recordings',

  automation: '/dashboard/automation',
  settings: '/dashboard/settings',
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
