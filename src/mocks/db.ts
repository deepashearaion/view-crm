import type { User } from '@/features/auth';
import type { StoredFileDto } from '@/features/extras';
import type { ReportDto } from '@/features/reports';
import type { RepAlert } from '@/features/tasks';

import { seedAttendance } from './seed/attendance';
import { seedCalls } from './seed/calls';
import { seedCompanies, seedCustomFields } from './seed/companies';
import { seedContacts } from './seed/contacts';
import { seedDeals, seedStages } from './seed/deals';
import { seedProducts } from './seed/products';
import { seedTasks } from './seed/tasks';

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/** Ids match the legacy owner map so real backend data resolves to the same names. */
const users: User[] = [
  { id: '1', name: 'Arun', email: 'arun@dealconverter.com', role: 'admin' },
  { id: '2', name: 'Priya Sharma', email: 'priya@dealconverter.com', role: 'manager' },
  { id: '3', name: 'Rajesh Kumar', email: 'rajesh@dealconverter.com', role: 'rep' },
  { id: '4', name: 'Kanishka C', email: 'kanishka@dealconverter.com', role: 'rep' },
  { id: '7', name: 'Self', email: 'self@dealconverter.com', role: 'rep' },
  { id: '8', name: 'Kani', email: 'kani@dealconverter.com', role: 'rep' },
  { id: '14', name: 'Dev User', email: 'dev@dealconverter.com', role: 'rep' },
];

/** In-memory data store backing the mock API. Resets on page reload. */
export const db = {
  users,
  contacts: seedContacts(),
  companies: seedCompanies(),
  companyFields: [...seedCustomFields],
  tasks: seedTasks(),
  deals: seedDeals(),
  stages: [...seedStages],
  products: seedProducts(),
  attendance: seedAttendance(),
  calls: seedCalls(),
  files: [] as StoredFileDto[],
  reports: [
    {
      id: 701,
      name: 'Pipeline by stage',
      module: 'Deals',
      type: 'bar',
      description: 'Open deal value per pipeline stage.',
      owner_id: 1,
      created_at: minutesAgo(60 * 24 * 12),
    },
    {
      id: 702,
      name: 'Lead sources this quarter',
      module: 'Contacts',
      type: 'pie',
      description: 'Where new leads come from: WhatsApp, web forms, email.',
      owner_id: 2,
      created_at: minutesAgo(60 * 24 * 30),
    },
    {
      id: 703,
      name: 'Rep call productivity',
      module: 'Call productivity',
      type: 'table',
      description: '',
      owner_id: 1,
      created_at: minutesAgo(60 * 24 * 45),
    },
  ] satisfies ReportDto[] as ReportDto[],
  alerts: [
    {
      id: 'alt_001',
      kind: 'hot_lead',
      title: 'Hot lead assigned: Priya Nair',
      summary: 'Asked for a Goa package for 4 adults in December; budget confirmed via WhatsApp.',
      automated: true,
      read: false,
      createdAt: minutesAgo(4),
      href: '/dashboard/leads',
    },
    {
      id: 'alt_002',
      kind: 'reply_received',
      title: 'Rahul Mehta replied to nurture email',
      summary: 'Lead re-scored from cold to warm after asking about Kerala dates.',
      automated: true,
      read: false,
      createdAt: minutesAgo(38),
      href: '/dashboard/nurture',
    },
    {
      id: 'alt_003',
      kind: 'task_due',
      title: 'Follow-up call due at 4:00 PM',
      summary: 'Call Ananya Rao to confirm the Manali itinerary.',
      automated: false,
      read: true,
      createdAt: minutesAgo(180),
      href: '/dashboard/tasks',
    },
  ] satisfies RepAlert[] as RepAlert[],
};

let nextId = 5000;
/** Monotonic ids for records created through the mock API. */
export const newId = (): number => ++nextId;
