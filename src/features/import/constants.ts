import type { ImportField, ImportTarget } from './types';

export const IMPORT_FIELDS: Record<ImportTarget, ImportField[]> = {
  contacts: [
    {
      key: 'fullName',
      label: 'Full name',
      aliases: ['name', 'fullname', 'contactname', 'contact'],
    },
    { key: 'firstName', label: 'First name', aliases: ['firstname', 'first', 'givenname'] },
    { key: 'lastName', label: 'Last name', aliases: ['lastname', 'last', 'surname', 'familyname'] },
    { key: 'email', label: 'Email', aliases: ['email', 'emailaddress', 'mail'] },
    {
      key: 'mobile',
      label: 'Mobile',
      required: true,
      aliases: ['mobile', 'phone', 'mobilenumber', 'phonenumber', 'contactnumber', 'whatsapp'],
    },
    {
      key: 'alternateMobile',
      label: 'Alternate mobile',
      aliases: ['alternatemobile', 'altmobile', 'alternatephone', 'secondaryphone'],
    },
    { key: 'status', label: 'Lead status', aliases: ['status', 'leadstatus'] },
    { key: 'source', label: 'Lead source', aliases: ['source', 'leadsource'] },
    {
      key: 'destination',
      label: 'Destination',
      aliases: ['destination', 'destinations', 'packagedestinations'],
    },
    { key: 'notes', label: 'Notes', aliases: ['notes', 'note', 'description', 'comments'] },
  ],
  companies: [
    {
      key: 'name',
      label: 'Company name',
      required: true,
      aliases: ['name', 'company', 'companyname', 'organisation', 'organization'],
    },
    { key: 'email', label: 'Email', aliases: ['email', 'emailaddress'] },
    { key: 'mobile', label: 'Phone', aliases: ['mobile', 'phone', 'phonenumber', 'contactnumber'] },
    { key: 'city', label: 'City', aliases: ['city', 'mailingcity', 'town'] },
    { key: 'state', label: 'State', aliases: ['state', 'region', 'province'] },
    { key: 'country', label: 'Country', aliases: ['country'] },
    {
      key: 'employees',
      label: 'Employees',
      aliases: ['employees', 'noofemployee', 'noofemployees', 'headcount', 'size'],
    },
    { key: 'website', label: 'Website', aliases: ['website', 'url', 'site', 'web'] },
    { key: 'leadSource', label: 'Lead source', aliases: ['source', 'leadsource'] },
    { key: 'description', label: 'Description', aliases: ['description', 'notes', 'about'] },
  ],
};

export const TARGET_LABELS: Record<ImportTarget, { singular: string; plural: string }> = {
  contacts: { singular: 'contact', plural: 'contacts' },
  companies: { singular: 'company', plural: 'companies' },
};

/** Largest file accepted, to keep parsing in the browser responsive. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 5000;

export const IMPORT_STEPS = ['Upload', 'Map columns', 'Review', 'Done'] as const;
