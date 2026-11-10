import { COUNTRY_CODES, DEFAULT_LEAD_STATUS_ID } from '../constants';
import type {
  Contact,
  ContactFormOutput,
  ContactFormValues,
  ContactWriteDto,
  LeadRequest,
} from '../types';

const DEFAULT_COUNTRY_CODE = '+91';

/** Splits a stored "+91 9876543210" into country code and local digits. */
export function splitPhone(value: string): { countryCode: string; digits: string } {
  const trimmed = value.trim();
  const known = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((entry) => trimmed.startsWith(entry.code));
  if (known)
    return { countryCode: known.code, digits: trimmed.slice(known.code.length).replace(/\D/g, '') };
  return { countryCode: DEFAULT_COUNTRY_CODE, digits: trimmed.replace(/\D/g, '').slice(-10) };
}

export function contactToFormValues(contact?: Contact, defaultOwnerId = ''): ContactFormValues {
  const mobile = splitPhone(contact?.mobile ?? '');
  const alternate = splitPhone(contact?.alternateMobile ?? '');
  return {
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    email: contact?.email ?? '',
    countryCode: contact ? mobile.countryCode : DEFAULT_COUNTRY_CODE,
    mobile: mobile.digits,
    alternateMobile: alternate.digits,
    companyId:
      contact?.companyId === null || contact?.companyId === undefined
        ? ''
        : String(contact.companyId),
    leadStatusId: String(contact?.leadStatusId ?? DEFAULT_LEAD_STATUS_ID),
    leadOwnerId: contact?.leadOwnerId ?? defaultOwnerId,
    destination: contact?.destination ?? '',
    source: contact?.source ?? '',
    notes: contact?.notes ?? '',
    trip: contact?.trip ?? {},
  };
}

const phone = (countryCode: string, digits: string) => (digits ? `${countryCode} ${digits}` : '');

/** Full body for legacy PATCH /api/contacts/{id} (edit). */
export function formValuesToDto(values: ContactFormOutput): ContactWriteDto {
  return {
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    mobile: phone(values.countryCode, values.mobile),
    alternate_mobile: phone(values.countryCode, values.alternateMobile),
    company_id: values.companyId ? Number(values.companyId) : null,
    lead_status_id: Number(values.leadStatusId),
    lead_owner_id: values.leadOwnerId ? Number(values.leadOwnerId) : null,
    destination: values.destination,
    source: values.source,
    notes: values.notes,
    trip: values.trip,
  };
}

/** Drops empty strings so /api/v1 only receives what the user filled in. */
function compact<T extends object>(body: T): T {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== '' && value !== undefined),
  ) as T;
}

/**
 * Splits the create form into the POST /api/v1/leads body and a follow-up legacy PATCH for the
 * fields the leads endpoint doesn't accept (null when there is nothing to patch).
 */
export function formValuesToLead(values: ContactFormOutput): {
  lead: LeadRequest;
  followUp: ContactWriteDto | null;
} {
  const lead = compact<LeadRequest>({
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    mobile: phone(values.countryCode, values.mobile),
    destination: values.destination,
    source: values.source,
    notes: values.notes,
    channel: 'manual',
  });

  const followUp: ContactWriteDto = {};
  if (values.companyId) followUp.company_id = Number(values.companyId);
  if (values.leadOwnerId) followUp.lead_owner_id = Number(values.leadOwnerId);
  if (values.alternateMobile)
    followUp.alternate_mobile = phone(values.countryCode, values.alternateMobile);
  const statusId = Number(values.leadStatusId);
  // Always set: the leads endpoint leaves lead_status_id empty and the form defaults it.
  if (statusId) followUp.lead_status_id = statusId;
  if (Object.values(values.trip).some(Boolean)) followUp.trip = values.trip;

  return { lead, followUp: Object.keys(followUp).length ? followUp : null };
}
