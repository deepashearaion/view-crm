import type { DealDto, DealPriority, DealStage } from '@/features/deals';

const DAY = 86_400_000;

export const seedStages: DealStage[] = [
  { id: 'qualification', name: 'Qualification', kind: 'open', probability: 10, color: 'chart-3' },
  { id: 'needs_analysis', name: 'Needs analysis', kind: 'open', probability: 30, color: 'chart-4' },
  { id: 'proposal', name: 'Proposal', kind: 'open', probability: 50, color: 'chart-2' },
  { id: 'negotiation', name: 'Negotiation', kind: 'open', probability: 70, color: 'chart-1' },
  { id: 'won', name: 'Closed won', kind: 'won', probability: 100, color: 'success' },
  { id: 'lost', name: 'Closed lost', kind: 'lost', probability: 0, color: 'destructive' },
];

const demo: [string, number, string, number | null, number | null, DealPriority, number][] = [
  ['Goa family package, December', 186000, 'proposal', 1001, null, 'high', 12],
  ['Kerala backwaters honeymoon', 142000, 'negotiation', 1002, 101, 'medium', 6],
  ['Manali group trip (12 pax)', 312000, 'qualification', 1003, 102, 'medium', 30],
  ['Kashmir winter escape', 98000, 'needs_analysis', 1004, null, 'low', 21],
  ['Bali couple retreat', 224000, 'proposal', 1005, null, 'high', 9],
  ['Dubai corporate offsite', 860000, 'negotiation', 1006, 105, 'high', 4],
  ['Maldives anniversary', 410000, 'won', 1007, null, 'medium', -3],
  ['Thailand backpacking', 76000, 'lost', 1008, null, 'low', -10],
  ['Ooty weekend getaway', 38000, 'qualification', 1009, null, 'low', 40],
  ['Europe summer tour', 1240000, 'needs_analysis', 1010, 100, 'high', 60],
];

export function seedDeals(now: number = Date.now()): DealDto[] {
  return demo.map(([title, value, stageId, contactId, companyId, priority, closeInDays], index) => {
    const created = new Date(now - (index * 4 + 2) * DAY).toISOString();
    return {
      id: 400 + index,
      title,
      value,
      stage_id: stageId,
      owner_id: [1, 2, 7, 3][index % 4] ?? null,
      contact_id: contactId,
      company_id: companyId,
      priority,
      expected_close: new Date(now + closeInDays * DAY).toISOString(),
      created_at: created,
      updated_at: created,
    };
  });
}
