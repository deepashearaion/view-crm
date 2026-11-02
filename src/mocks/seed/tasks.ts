import type { TaskDto, TaskType } from '@/features/tasks';

const HOUR = 3_600_000;

const TYPE_FROM_LEGACY: Record<string, TaskType> = {
  'Follow-up Call (Call)': 'call',
  'Meeting (Client)': 'meeting',
  'Email Follow-up': 'email',
  'Demo / Presentation': 'demo',
  'Send Quotation': 'quotation',
};

const OWNER_FROM_LEGACY: Record<string, number> = {
  Arun: 1,
  'Priya Sharma': 2,
  'Rajesh Kumar': 3,
  Self: 7,
};

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** "10:00 AM" + "2026-11-03" → ISO string. */
function legacyDue(date: string, time: string, fallback: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(time.trim());
  let hours = 10;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]) % 12;
    minutes = Number(match[2]);
    if (match[3]?.toUpperCase() === 'PM') hours += 12;
    if (!match[3]) hours = Number(match[1]);
  }
  const due = new Date(`${date}T00:00:00`);
  if (Number.isNaN(due.getTime())) return fallback;
  due.setHours(hours, minutes, 0, 0);
  return due.toISOString();
}

function legacyTasks(now: number): TaskDto[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem('dealconverter_activities_data') ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item, index) => {
        const created = new Date(now - index * HOUR).toISOString();
        return {
          id: 3001 + index,
          title: text(item.name) || text(item.validator) || 'Task',
          type: TYPE_FROM_LEGACY[text(item.validator)] ?? 'call',
          due_at: legacyDue(text(item.dueDate), text(item.dueTime), created),
          owner_id: OWNER_FROM_LEGACY[text(item.owner)] ?? null,
          contact_id: null,
          company_id: null,
          description: [
            text(item.description),
            text(item.contact) && `Contact: ${text(item.contact)}`,
            text(item.company) && `Company: ${text(item.company)}`,
          ]
            .filter(Boolean)
            .join('\n'),
          origin: 'manual',
          completed_at: text(item.status) === 'Completed' ? created : null,
          created_at: created,
          updated_at: created,
        };
      });
  } catch {
    return [];
  }
}

const demo: [
  string,
  TaskType,
  number,
  number | null,
  number | null,
  'manual' | 'automation',
  boolean,
][] = [
  ['Call Priya Nair: hot lead from WhatsApp', 'call', 1, 1001, null, 'automation', false],
  ['Send Goa quotation to Priya Nair', 'quotation', 26, 1001, null, 'manual', false],
  ['Confirm Manali itinerary with Ananya', 'call', -3, 1003, null, 'manual', false],
  ['Kerala package demo for Rahul', 'demo', 50, 1002, 101, 'manual', false],
  ['Quarterly review with Ivory Holidays', 'meeting', 74, null, 100, 'manual', false],
  ['Email follow-up: Bali honeymoon', 'email', -20, 1005, null, 'manual', false],
  ['Follow up on Dubai visa documents', 'call', -48, 1006, null, 'manual', true],
  ['Presentation for Metro Corporate Travel', 'presentation', 120, null, 105, 'manual', false],
];

export function seedTasks(now: number = Date.now()): TaskDto[] {
  const legacy = legacyTasks(now);
  if (legacy.length > 0) return legacy;
  return demo.map(([title, type, dueInHours, contactId, companyId, origin, done], index) => {
    const due = new Date(now + dueInHours * HOUR);
    due.setMinutes(0, 0, 0);
    const created = new Date(now - (index + 2) * 6 * HOUR).toISOString();
    return {
      id: 300 + index,
      title,
      type,
      due_at: due.toISOString(),
      owner_id: [7, 1, 2, 7, 1, 3, 7, 2][index] ?? null,
      contact_id: contactId,
      company_id: companyId,
      description: '',
      origin,
      completed_at: done ? new Date(now - 30 * HOUR).toISOString() : null,
      created_at: created,
      updated_at: created,
    };
  });
}
