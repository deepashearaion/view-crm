/** Lead statuses keyed by the backend `lead_status_id`. Single source of truth. */
export const LEAD_STATUSES = [
  { id: 1, label: 'Hot lead', variant: 'hot' },
  { id: 2, label: 'Warm lead', variant: 'warm' },
  { id: 3, label: 'Cold lead', variant: 'cold' },
  { id: 4, label: 'Open deal', variant: 'human' },
  { id: 5, label: 'Follow up', variant: 'decision' },
  { id: 6, label: 'Closed won', variant: 'ai' },
] as const;

export const DEFAULT_LEAD_STATUS_ID = 3;

export function leadStatusById(id: number | null | undefined) {
  return LEAD_STATUSES.find((status) => status.id === id);
}

export const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA / Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
] as const;

export const LEAD_SOURCES = [
  'Website',
  'WhatsApp',
  'Email',
  'Instagram',
  'Facebook',
  'Google Form',
  'IndiaMART',
  'TradeIndia',
  'JustDial',
  'Referral',
  'Cold Call',
  'Advertisement',
  'LinkedIn',
  'Others',
] as const;

export const DESTINATIONS = [
  'Manali',
  'Goa',
  'Kashmir',
  'Dubai',
  'Kerala',
  'Ooty',
  'Shimla',
  'Madurai',
  'Chennai',
  'Thailand',
  'Bali',
  'Maldives',
  'Europe',
  'Singapore',
] as const;

export const CONTACT_TYPES = [
  'Customer',
  'Lead',
  'Partner',
  'Vendor',
  'Prospect',
  'Other',
] as const;
export const CONTACTED_OPTIONS = ['Yes', 'No', 'Pending', 'Attempted'] as const;
export const ADVANCE_STATUSES = [
  'Received',
  'Pending',
  'Partially Received',
  'Not Applicable',
] as const;
export const INVOICE_SHARED_OPTIONS = ['Yes', 'No', 'Drafted', 'Sent'] as const;
export const POST_TRIP_OPTIONS = [
  'Completed Successfully',
  'Feedback Collected',
  'Pending Feedback',
  'Escalated',
  'Other',
] as const;
export const TRIP_ISSUE_OPTIONS = [
  'No Issues',
  'Hotel Issue',
  'Cab / Transport Issue',
  'Flight Delay',
  'Guide Issue',
  'Resolved',
  'Other',
] as const;
export const TICKET_OPTIONS = [
  'Yes',
  'No',
  'In Progress',
  'Partially Booked',
  'Not Required',
] as const;
export const ARRANGEMENT_OPTIONS = ['Yes', 'No', 'In Progress', 'Pending', 'Confirmed'] as const;
export const QUOTE_SHARED_OPTIONS = ['Yes', 'No', 'Shared', 'Draft', 'Pending'] as const;
export const YES_NO = ['Yes', 'No'] as const;

export const contactKeys = {
  all: ['contacts'] as const,
  list: () => [...contactKeys.all, 'list'] as const,
  detail: (id: string) => [...contactKeys.all, 'detail', id] as const,
};
