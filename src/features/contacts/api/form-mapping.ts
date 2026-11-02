import { COUNTRY_CODES, DEFAULT_LEAD_STATUS_ID } from '../constants';
import type { Contact, ContactFormOutput, ContactFormValues, ContactWriteDto } from '../types';

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

export function formValuesToDto(values: ContactFormOutput): ContactWriteDto {
  return {
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    mobile: `${values.countryCode} ${values.mobile}`,
    alternate_mobile: values.alternateMobile
      ? `${values.countryCode} ${values.alternateMobile}`
      : '',
    company_id: values.companyId ? Number(values.companyId) : null,
    lead_status_id: Number(values.leadStatusId),
    lead_owner_id: values.leadOwnerId ? Number(values.leadOwnerId) : null,
    destination: values.destination,
    source: values.source,
    notes: values.notes,
    trip: values.trip,
  };
}
