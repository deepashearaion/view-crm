import type { CompanyDto, CompanyStatus, CustomFieldDefinition } from '@/features/companies';

const DAY = 86_400_000;

const blank = {
  zipcode: '',
  address: '',
  website: '',
  linkedin: '',
  instagram: '',
  facebook: '',
  twitter: '',
  email_opt_out: false,
  sms_opt_out: false,
  custom_fields: {},
} satisfies Partial<CompanyDto>;

const demo: [string, string, CompanyStatus, string, string, number | null][] = [
  ['Ivory Holidays', 'Bengaluru', 'qualified', 'Karnataka', 'Referral', 45],
  ['Coastal Escapes', 'Kochi', 'warm', 'Kerala', 'Website', 18],
  ['Himalayan Trails', 'Manali', 'hot', 'Himachal Pradesh', 'LinkedIn', 12],
  ['Desert Rose Tours', 'Jaipur', 'contacted', 'Rajasthan', 'Trade Show', 30],
  ['Island Hoppers', 'Port Blair', 'new', 'Andaman & Nicobar', 'Cold Call', 8],
  ['Metro Corporate Travel', 'Mumbai', 'proposal_sent', 'Maharashtra', 'Partner', 120],
  ['Southern Sojourns', 'Chennai', 'cold', 'Tamil Nadu', 'Advertisement', null],
];

const STATUS_FROM_LEGACY: Record<string, CompanyStatus> = {
  New: 'new',
  'Cold Leads': 'cold',
  'Warm Leads': 'warm',
  'Hot Leads': 'hot',
  Contacted: 'contacted',
  Qualified: 'qualified',
  'Proposal Sent': 'proposal_sent',
};

const OWNER_FROM_LEGACY: Record<string, number> = {
  Arun: 1,
  'Priya Sharma': 2,
  'Rajesh Kumar': 3,
  Self: 7,
};

function text(value: unknown): string {
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
}

function count(value: unknown): number | null {
  const parsed = Number.parseInt(text(value).replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function date(value: unknown, fallback: string): string {
  const parsed = new Date(text(value));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

/** Companies saved by the old localStorage-only page, so they aren't lost after the upgrade. */
function legacyCompanies(now: number): CompanyDto[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem('dealconverter_companies_data') ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .filter((item) => text(item.name).trim() !== '')
      .map((item, index) => {
        const created = date(item.created, new Date(now - index * DAY).toISOString());
        return {
          ...blank,
          id: 2001 + index,
          name: text(item.name).trim(),
          email: text(item.email),
          mobile: text(item.mobile),
          status: STATUS_FROM_LEGACY[text(item.status)] ?? 'new',
          owner_id: OWNER_FROM_LEGACY[text(item.owner)] ?? null,
          employees: count(item.employees),
          annual_revenue: count(item.revenue),
          city: text(item.city),
          state: text(item.state),
          country: text(item.country) || 'India',
          zipcode: text(item.zipcode),
          address: text(item.address_1),
          description: text(item.description),
          lead_source: text(item.lead_source),
          instagram: text(item.instagram),
          facebook: text(item.facebook),
          twitter: text(item.twitter),
          linkedin: text(item.linkedin),
          email_opt_out: text(item.email_opt_out) === 'Yes',
          sms_opt_out: text(item.sms_opt_out) === 'Yes',
          created_at: created,
          updated_at: date(item.modified, created),
        };
      });
  } catch {
    return [];
  }
}

export function seedCompanies(now: number = Date.now()): CompanyDto[] {
  const legacy = legacyCompanies(now);
  if (legacy.length > 0) return legacy;
  return demo.map(([name, city, status, state, source, employees], index) => {
    const created = new Date(now - (index * 9 + 1) * DAY).toISOString();
    return {
      ...blank,
      id: 100 + index,
      name,
      email: `hello@${name.toLowerCase().replace(/[^a-z]+/g, '')}.in`,
      mobile: `+91 80${String(41000000 + index * 1_234_567).slice(0, 8)}`,
      status,
      owner_id: [1, 2, 3, 7][index % 4] ?? null,
      employees,
      annual_revenue: employees ? employees * 1_250_000 : null,
      city,
      state,
      country: 'India',
      description: '',
      lead_source: source,
      website: `https://${name.toLowerCase().replace(/[^a-z]+/g, '')}.in`,
      created_at: created,
      updated_at: created,
    };
  });
}

export const seedCustomFields: CustomFieldDefinition[] = [
  { id: 'industry', label: 'Industry', type: 'text' },
];
