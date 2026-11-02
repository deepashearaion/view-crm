import type { ContactDto } from '@/features/contacts';

const people: [string, string, string, string][] = [
  ['Priya', 'Nair', 'Goa', 'WhatsApp'],
  ['Rahul', 'Mehta', 'Kerala', 'Email'],
  ['Ananya', 'Rao', 'Manali', 'Website'],
  ['Vikram', 'Singh', 'Kashmir', 'Referral'],
  ['Sneha', 'Iyer', 'Bali', 'Instagram'],
  ['Arjun', 'Kapoor', 'Dubai', 'Google Form'],
  ['Meera', 'Pillai', 'Maldives', 'WhatsApp'],
  ['Karthik', 'Subramanian', 'Thailand', 'JustDial'],
  ['Divya', 'Menon', 'Ooty', 'Website'],
  ['Rohan', 'Desai', 'Europe', 'LinkedIn'],
  ['Aisha', 'Khan', 'Singapore', 'Email'],
  ['Nikhil', 'Joshi', 'Shimla', 'Facebook'],
  ['Pooja', 'Reddy', 'Goa', 'IndiaMART'],
  ['Siddharth', 'Bose', 'Kerala', 'WhatsApp'],
  ['Lakshmi', 'Narayanan', 'Madurai', 'Cold Call'],
  ['Farhan', 'Ali', 'Dubai', 'Advertisement'],
  ['Neha', 'Gupta', 'Bali', 'Website'],
  ['Aditya', 'Verma', 'Manali', 'Referral'],
  ['Kavya', 'Shetty', 'Maldives', 'Instagram'],
  ['Harish', 'Kumar', 'Chennai', 'TradeIndia'],
  ['Ishita', 'Banerjee', 'Europe', 'Email'],
  ['Manoj', 'Patil', 'Kashmir', 'WhatsApp'],
  ['Ritika', 'Malhotra', 'Thailand', 'Google Form'],
  ['Suresh', 'Babu', 'Ooty', 'Others'],
];

const owners = [1, 2, 3, 7, null] as const;
const DAY = 86_400_000;

/** Deterministic demo contacts spread over the last ~90 days. */
export function seedContacts(now: number = Date.now()): ContactDto[] {
  return people.map(([first, last, destination, source], index) => {
    const created = new Date(now - (index * 3.7 + 0.2) * DAY);
    const updated = new Date(created.getTime() + ((index % 4) + 1) * 0.6 * DAY);
    return {
      id: 1001 + index,
      first_name: first,
      last_name: last,
      email: `${first}.${last}@example.com`.toLowerCase(),
      mobile: `+91 98${String(40000000 + index * 731_117).slice(0, 8)}`,
      alternate_mobile:
        index % 5 === 0 ? `+91 97${String(10000000 + index * 91_337).slice(0, 8)}` : '',
      company_id: index % 3 === 0 ? 100 + (index % 6) : null,
      lead_status_id: (index % 6) + 1,
      lead_owner_id: owners[index % owners.length] ?? null,
      destination,
      source,
      notes: index % 4 === 0 ? `Interested in a ${destination} package for the holidays.` : '',
      created_at: created.toISOString(),
      updated_at: (updated.getTime() > now ? created : updated).toISOString(),
    };
  });
}
