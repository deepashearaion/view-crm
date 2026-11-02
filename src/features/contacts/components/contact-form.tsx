import { CloudOff } from 'lucide-react';
import { useWatch, type Control, type FieldPath } from 'react-hook-form';

import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { optionsFrom } from '@/components/form/options';
import { FormTextarea } from '@/components/form/form-textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUsers } from '@/features/auth';
import { formatCurrency } from '@/lib/format';

import {
  ADVANCE_STATUSES,
  ARRANGEMENT_OPTIONS,
  CONTACT_TYPES,
  CONTACTED_OPTIONS,
  COUNTRY_CODES,
  DESTINATIONS,
  INVOICE_SHARED_OPTIONS,
  LEAD_SOURCES,
  LEAD_STATUSES,
  POST_TRIP_OPTIONS,
  QUOTE_SHARED_OPTIONS,
  TICKET_OPTIONS,
  TRIP_ISSUE_OPTIONS,
  YES_NO,
} from '../constants';
import type { ContactFormValues } from '../types';

type TripField =
  | {
      name: FieldPath<ContactFormValues>;
      label: string;
      kind: 'select';
      options: readonly string[];
    }
  | { name: FieldPath<ContactFormValues>; label: string; kind: 'text' | 'number' | 'date' };

const tripSections: { title: string; fields: TripField[] }[] = [
  {
    title: 'Profile',
    fields: [
      { name: 'trip.type', label: 'Contact type', kind: 'select', options: CONTACT_TYPES },
      { name: 'trip.contacted', label: 'Contacted', kind: 'select', options: CONTACTED_OPTIONS },
      { name: 'trip.whatsappOptIn', label: 'WhatsApp opt-in', kind: 'select', options: YES_NO },
      { name: 'trip.spokenLanguage', label: 'Spoken language', kind: 'text' },
      { name: 'trip.state', label: 'State', kind: 'text' },
      { name: 'trip.address', label: 'Address', kind: 'text' },
    ],
  },
  {
    title: 'Trip & payment',
    fields: [
      { name: 'trip.travelDate', label: 'Travel date', kind: 'date' },
      { name: 'trip.travellers', label: 'Travellers', kind: 'number' },
      { name: 'trip.children', label: 'Children', kind: 'number' },
      { name: 'trip.totalAmount', label: 'Total amount (₹)', kind: 'number' },
      { name: 'trip.advanceAmount', label: 'Advance amount (₹)', kind: 'number' },
      {
        name: 'trip.advanceStatus',
        label: 'Advance status',
        kind: 'select',
        options: ADVANCE_STATUSES,
      },
    ],
  },
  {
    title: 'Quote & booking',
    fields: [
      { name: 'trip.quoteRequired', label: 'Quote required', kind: 'select', options: YES_NO },
      {
        name: 'trip.quoteShared',
        label: 'Quote shared',
        kind: 'select',
        options: QUOTE_SHARED_OPTIONS,
      },
      {
        name: 'trip.invoiceShared',
        label: 'Invoice shared',
        kind: 'select',
        options: INVOICE_SHARED_OPTIONS,
      },
      {
        name: 'trip.ticketsBooked',
        label: 'Tickets booked',
        kind: 'select',
        options: TICKET_OPTIONS,
      },
      {
        name: 'trip.arrangementsMade',
        label: 'Arrangements made',
        kind: 'select',
        options: ARRANGEMENT_OPTIONS,
      },
      { name: 'trip.postTrip', label: 'Post trip', kind: 'select', options: POST_TRIP_OPTIONS },
      {
        name: 'trip.tripIssues',
        label: 'During-trip issues',
        kind: 'select',
        options: TRIP_ISSUE_OPTIONS,
      },
    ],
  },
];

const statusOptions: SelectOption[] = LEAD_STATUSES.map((status) => ({
  value: String(status.id),
  label: status.label,
}));

const countryOptions: SelectOption[] = COUNTRY_CODES.map((entry) => ({
  value: entry.code,
  label: `${entry.code} ${entry.country}`,
}));

function RemainingAmount({ control }: { control: Control<ContactFormValues> }) {
  const [total, advance] = useWatch({ control, name: ['trip.totalAmount', 'trip.advanceAmount'] });
  const remaining = Number(total ?? '') - Number(advance ?? '');
  if (!total || Number.isNaN(remaining)) return null;
  return (
    <p className="text-sm text-muted-foreground sm:col-span-2">
      Remaining amount:{' '}
      <span className="font-medium text-foreground tabular-nums">
        {formatCurrency(Math.max(0, remaining))}
      </span>
    </p>
  );
}

export function ContactForm({ control }: { control: Control<ContactFormValues> }) {
  const { data: users = [] } = useUsers();
  const ownerOptions: SelectOption[] = users.map((user) => ({ value: user.id, label: user.name }));

  return (
    <FieldGroup className="gap-8">
      <FieldSet>
        <FieldLegend>Contact</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={control}
            name="firstName"
            label="First name"
            autoComplete="off"
            autoFocus
          />
          <FormInput control={control} name="lastName" label="Last name" autoComplete="off" />
          <FormInput
            control={control}
            name="email"
            label="Email"
            type="email"
            autoComplete="off"
            className="sm:col-span-2"
          />
          <FormSelect
            control={control}
            name="countryCode"
            label="Country code"
            options={countryOptions}
          />
          <FormInput
            control={control}
            name="mobile"
            label="Mobile"
            inputMode="tel"
            placeholder="10-digit number"
          />
          <FormInput
            control={control}
            name="alternateMobile"
            label="Alternate mobile"
            inputMode="tel"
            placeholder="Optional"
            className="sm:col-span-2"
          />
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Lead</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            control={control}
            name="leadStatusId"
            label="Lead status"
            options={statusOptions}
          />
          <FormSelect
            control={control}
            name="leadOwnerId"
            label="Lead owner"
            options={ownerOptions}
            allowEmpty
            placeholder="Unassigned"
          />
          <FormSelect
            control={control}
            name="source"
            label="Lead source"
            options={optionsFrom(LEAD_SOURCES)}
            allowEmpty
          />
          <FormInput
            control={control}
            name="destination"
            label="Destination"
            list="destination-options"
            placeholder="e.g. Goa"
          />
          <datalist id="destination-options">
            {DESTINATIONS.map((destination) => (
              <option key={destination} value={destination} />
            ))}
          </datalist>
          <FormInput control={control} name="companyId" label="Company ID" inputMode="numeric" />
        </div>
        <FormTextarea control={control} name="notes" label="Notes" rows={3} />
      </FieldSet>

      <Accordion type="single" collapsible className="rounded-lg border px-4">
        <AccordionItem value="trip" className="border-none">
          <AccordionTrigger className="gap-2 hover:no-underline">
            <span className="flex flex-1 items-center gap-2">
              Trip details
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    <CloudOff aria-hidden />
                    Not synced
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  These fields are kept by the demo API only. The backend doesn’t store them yet.
                </TooltipContent>
              </Tooltip>
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {tripSections.map((section) => (
              <FieldSet key={section.title}>
                <FieldLegend variant="label">{section.title}</FieldLegend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) =>
                    field.kind === 'select' ? (
                      <FormSelect
                        key={field.name}
                        control={control}
                        name={field.name}
                        label={field.label}
                        options={optionsFrom(field.options)}
                        allowEmpty
                      />
                    ) : (
                      <FormInput
                        key={field.name}
                        control={control}
                        name={field.name}
                        label={field.label}
                        type={field.kind === 'date' ? 'date' : 'text'}
                        inputMode={field.kind === 'number' ? 'decimal' : undefined}
                      />
                    ),
                  )}
                  {section.title === 'Trip & payment' && <RemainingAmount control={control} />}
                </div>
              </FieldSet>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </FieldGroup>
  );
}
