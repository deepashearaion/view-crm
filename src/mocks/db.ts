import type { RepAlert } from '@/features/tasks';

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/** In-memory data store backing the mock API. Resets on page reload. */
export const db = {
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
