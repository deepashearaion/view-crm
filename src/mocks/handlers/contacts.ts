import type { ContactDto } from '@/features/contacts';

import { db, newId } from '../db';
import { mock, mockError } from '../router';

type ContactWrite = Partial<Omit<ContactDto, 'id' | 'created_at' | 'updated_at'>>;

function asWrite(body: unknown): ContactWrite {
  if (typeof body !== 'object' || body === null) mockError(400, 'Invalid request body');
  return body;
}

function find(id: string | undefined): ContactDto {
  const contact = db.contacts.find((item) => String(item.id) === id);
  if (!contact) mockError(404, 'Contact not found');
  return contact;
}

mock('GET', '/api/contacts', () => ({ contacts: db.contacts }));

mock('GET', '/api/contacts/:id', ({ params }) => ({ contact: find(params.id) }));

mock('POST', '/api/contacts', ({ body }) => {
  const input = asWrite(body);
  if (!input.first_name?.trim()) mockError(400, 'first_name is required');
  const now = new Date().toISOString();
  const contact: ContactDto = {
    id: newId(),
    first_name: input.first_name,
    last_name: input.last_name ?? '',
    email: input.email ?? '',
    mobile: input.mobile ?? '',
    alternate_mobile: input.alternate_mobile ?? '',
    company_id: input.company_id ?? null,
    lead_status_id: input.lead_status_id ?? null,
    lead_owner_id: input.lead_owner_id ?? null,
    destination: input.destination ?? '',
    source: input.source ?? '',
    notes: input.notes ?? '',
    trip: input.trip,
    created_at: now,
    updated_at: now,
  };
  db.contacts.unshift(contact);
  return { message: 'Contact created successfully', contact };
});

mock('PATCH', '/api/contacts/:id', ({ params, body }) => {
  const contact = find(params.id);
  Object.assign(contact, asWrite(body), { updated_at: new Date().toISOString() });
  return { message: 'Contact updated successfully', contact };
});

mock('DELETE', '/api/contacts/:id', ({ params }) => {
  const contact = find(params.id);
  db.contacts = db.contacts.filter((item) => item !== contact);
  return { message: 'Contact deleted successfully' };
});
