import { zodResolver } from '@hookform/resolvers/zod';
import { FileCheck2, Plus, Save, Settings2, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldPath,
} from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/data/page-header';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { FormSwitch } from '@/components/form/form-switch';
import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { useContacts, type Contact } from '@/features/contacts';
import { useDeals, type Deal } from '@/features/deals';
import type { Product } from '@/features/products';
import { bpToPercent, formatPaise, rupeesToPaise } from '@/lib/format';
import { fieldReasonMessage, isHttpError } from '@/services';

import { invoiceErrorMessage, isStaleInvoiceError } from '../api/errors';
import {
  emptyLine,
  estimateInvoice,
  formValuesToCreateDto,
  formValuesToPatchDto,
  invoiceFormField,
  invoiceToFormValues,
  rupeesInput,
} from '../api/form-mapping';
import {
  BILLING_PROFILE_DEFAULTS,
  GST_RATES_BP,
  GST_STATES,
  gstStateName,
  invoicePaths,
} from '../constants';
import type { InvoiceActions } from '../hooks/use-invoice-actions';
import { useCreateInvoice, useUpdateInvoice } from '../hooks/use-invoices';
import { GSTIN_PATTERN, invoiceFormSchema } from '../schemas';
import type {
  BillingProfile,
  Invoice,
  InvoiceFormOutput,
  InvoiceFormValues,
  InvoiceLineFormValues,
} from '../types';
import { CataloguePicker } from './catalogue-picker';
import { InvoiceStatusBadge } from './invoice-status-badge';
import { InvoiceTotals } from './invoice-totals';
import { RecordCombobox, type ComboboxItem } from './record-combobox';

const FORM_ID = 'invoice-form';
const FIX_MESSAGE = 'Needed to issue this invoice.';

const stateOptions: SelectOption[] = GST_STATES.map((state) => ({
  value: state.code,
  label: `${state.code} · ${state.name}`,
}));
const rateOptions: SelectOption[] = GST_RATES_BP.map((bp) => ({
  value: String(bp),
  label: `${bpToPercent(bp)}%`,
}));

const DEAL_STATUS_LABELS: Record<Deal['status'], string> = {
  open: 'Open',
  won: 'Won',
  lost: 'Lost',
};

const isBlankLine = (line: InvoiceLineFormValues) =>
  !line.description.trim() && !line.unitPrice.trim();

/** Bill-to fields taken from a contact. */
function contactBillTo(contact: Contact) {
  return {
    billToName: contact.fullName,
    billToEmail: contact.email,
    billToPhone: contact.mobile,
  } as const;
}

/** A line for a deal's amount. */
function dealLine(deal: Deal, profile?: BillingProfile): InvoiceLineFormValues {
  return {
    ...emptyLine(profile),
    description: deal.title,
    unitPrice: deal.amountPaise ? rupeesInput(deal.amountPaise) : '',
  };
}

/** True when the profile lacks something issuing requires. */
function profileIncomplete(profile: BillingProfile | undefined) {
  return !profile?.legalName || !profile.gstin || !profile.stateCode || !profile.address;
}

interface InvoiceEditorProps {
  /** The draft being edited; undefined creates a new invoice. */
  invoice?: Invoice;
  profile?: BillingProfile;
  /** True once the billing profile query has settled (loaded or failed). */
  profileReady: boolean;
  /** Prefill for new invoices (?deal= / ?contact=). */
  initialDealId?: string;
  initialContactId?: string;
  /** Comma-separated API field names to highlight (from a 422 invoice_incomplete). */
  fix?: string;
  onCreated: (invoice: Invoice) => void;
  onSaved: () => void;
  onDeleted: () => void;
  actions: InvoiceActions;
}

/** Create / edit form for a draft invoice, with a live (estimated) GST summary. */
export function InvoiceEditor({
  invoice,
  profile,
  profileReady,
  initialDealId,
  initialContactId,
  fix = '',
  onCreated,
  onSaved,
  onDeleted,
  actions,
}: InvoiceEditorProps) {
  const isCreate = !invoice;
  const contactsQuery = useContacts();
  const dealsQuery = useDeals();
  const contacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);
  const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const mutation = isCreate ? createInvoice : updateInvoice;

  const form = useForm<InvoiceFormValues, unknown, InvoiceFormOutput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoiceToFormValues(invoice, profile),
  });
  const lines = useFieldArray({ control: form.control, name: 'lines' });
  const [contactId, placeOfSupply, billToGstin] = useWatch({
    control: form.control,
    name: ['contactId', 'placeOfSupply', 'billToGstin'],
  });
  const { isDirty } = form.formState;

  // Editing: mirror the saved draft (also after each save, which returns the new copy).
  useEffect(() => {
    if (invoice) form.reset(invoiceToFormValues(invoice));
  }, [invoice, form]);

  // Creating: start from the billing profile defaults and the ?deal= / ?contact= prefill, once.
  const initialized = useRef(false);
  const prefillReady =
    profileReady &&
    (!initialDealId || !dealsQuery.isPending) &&
    (!initialContactId || !contactsQuery.isPending);
  useEffect(() => {
    if (!isCreate || initialized.current || !prefillReady) return;
    initialized.current = true;
    const values = invoiceToFormValues(undefined, profile);
    const deal = initialDealId ? deals.find((item) => item.id === initialDealId) : undefined;
    const contactKey = deal?.contactId ?? initialContactId;
    const contact = contactKey ? contacts.find((item) => item.id === contactKey) : undefined;
    form.reset({
      ...values,
      ...(contact && { contactId: contact.id, ...contactBillTo(contact) }),
      ...(deal && { dealId: deal.id, lines: [dealLine(deal, profile)] }),
    });
  }, [isCreate, prefillReady, profile, deals, contacts, initialDealId, initialContactId, form]);

  // Highlight what a failed issue said was missing.
  const fixFields = useMemo(() => fix.split(',').filter(Boolean), [fix]);
  useEffect(() => {
    if (!invoice || fixFields.length === 0) return;
    let first: string | undefined;
    for (const apiField of fixFields) {
      const name = invoiceFormField(apiField);
      if (!name) continue;
      first ??= name;
      form.setError(
        name as FieldPath<InvoiceFormValues>,
        {
          type: 'server',
          message: name === 'lines' ? 'Add at least one line.' : FIX_MESSAGE,
        },
        { shouldFocus: name === first && name !== 'lines' },
      );
    }
  }, [invoice, fixFields, form]);

  const pickContact = (id: string) => {
    form.setValue('contactId', id, { shouldDirty: true });
    const contact = contacts.find((item) => item.id === id);
    if (contact) {
      for (const [key, value] of Object.entries(contactBillTo(contact)))
        form.setValue(key as keyof ReturnType<typeof contactBillTo>, value, {
          shouldDirty: true,
          shouldValidate: form.formState.isSubmitted,
        });
    }
    const dealId = form.getValues('dealId');
    const deal = deals.find((item) => item.id === dealId);
    if (deal && id && deal.contactId !== id) form.setValue('dealId', '', { shouldDirty: true });
  };

  const pickDeal = (id: string) => {
    form.setValue('dealId', id, { shouldDirty: true });
    const deal = deals.find((item) => item.id === id);
    if (!deal) return;
    if (deal.contactId && deal.contactId !== form.getValues('contactId'))
      pickContact(deal.contactId);
    if (form.getValues('lines').every(isBlankLine)) lines.replace([dealLine(deal, profile)]);
  };

  const addProduct = (product: Product) => {
    const pricesIncludeGst = form.getValues('pricesIncludeGst');
    const rateBp = Math.round(product.taxPercent * 100);
    const rate = (GST_RATES_BP as readonly number[]).includes(rateBp)
      ? rateBp
      : (profile?.defaultGstRateBp ?? BILLING_PROFILE_DEFAULTS.defaultGstRateBp);
    // Catalogue prices are in rupees, before tax.
    const pricePaise = rupeesToPaise(
      pricesIncludeGst ? product.sellingPrice * (1 + rate / 10000) : product.sellingPrice,
    );
    const line: InvoiceLineFormValues = {
      ...emptyLine(profile),
      description: product.name,
      unitPrice: rupeesInput(pricePaise),
      gstRateBp: String(rate),
    };
    const current = form.getValues('lines');
    const blankIndex = current.findIndex(isBlankLine);
    if (blankIndex >= 0) lines.update(blankIndex, line);
    else lines.append(line);
  };

  const onError = (error: Error) => {
    if (isStaleInvoiceError(error)) return;
    if (!isHttpError(error)) return;
    for (const [apiField, reason] of Object.entries(error.problem?.errors ?? {})) {
      const name = invoiceFormField(apiField);
      if (name)
        form.setError(name as FieldPath<InvoiceFormValues>, {
          type: 'server',
          message: fieldReasonMessage(reason),
        });
    }
  };

  const save = (afterSave?: (saved: Invoice) => void) =>
    form.handleSubmit((values) => {
      if (!invoice) {
        createInvoice.mutate(formValuesToCreateDto(values), {
          onSuccess: (created) => {
            toast.success('Draft invoice saved.');
            onCreated(created);
          },
          onError,
        });
        return;
      }
      updateInvoice.mutate(
        { id: invoice.id, body: formValuesToPatchDto(values) },
        {
          onSuccess: (saved) => {
            toast.success('Draft saved.');
            onSaved();
            afterSave?.(saved);
          },
          onError,
        },
      );
    });

  const issue = () => {
    if (!invoice) return;
    if (isDirty) void save(actions.issue)();
    else actions.issue(invoice);
  };

  const contactItems = useMemo<ComboboxItem[]>(
    () =>
      contacts.map((contact) => ({
        value: contact.id,
        label: contact.fullName || 'Unnamed contact',
        hint: contact.email || contact.mobile || undefined,
        keywords: `${contact.email} ${contact.mobile}`,
      })),
    [contacts],
  );
  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const dealItems = useMemo<ComboboxItem[]>(
    () =>
      deals
        .filter((deal) => !contactId || deal.contactId === contactId)
        .sort(
          (a, b) =>
            Number(b.status === 'won') - Number(a.status === 'won') ||
            b.updatedAt.localeCompare(a.updatedAt),
        )
        .map((deal) => ({
          value: deal.id,
          label: deal.title,
          hint: [
            DEAL_STATUS_LABELS[deal.status],
            formatPaise(deal.valuePaise),
            deal.contactId ? contactNames.get(deal.contactId) : undefined,
          ]
            .filter(Boolean)
            .join(' · '),
        })),
    [deals, contactId, contactNames],
  );

  const gstinState = GSTIN_PATTERN.test(billToGstin.trim().toUpperCase())
    ? billToGstin.trim().slice(0, 2)
    : '';
  const suggestState =
    gstinState && gstinState !== placeOfSupply && GST_STATES.some((s) => s.code === gstinState);
  const sellerState = profile?.stateCode ?? '';
  const linesError = form.formState.errors.lines;

  const busy = mutation.isPending;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title={isCreate ? 'New invoice' : 'Draft invoice'}
        description={
          isCreate
            ? 'Save it as a draft, review it, then issue it to assign the invoice number.'
            : 'Drafts can be changed freely. Issuing assigns the number and freezes the invoice.'
        }
        badges={<InvoiceStatusBadge status="draft" />}
        actions={
          <>
            {invoice ? (
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={busy}
                onClick={() => {
                  actions.remove(invoice, { onDeleted });
                }}
              >
                <Trash2 aria-hidden />
                Delete
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link to={invoicePaths.list}>
                  <X aria-hidden />
                  Cancel
                </Link>
              </Button>
            )}
            <Button
              type="submit"
              form={FORM_ID}
              variant={isCreate ? 'default' : 'outline'}
              disabled={busy || (!isCreate && !isDirty)}
            >
              <Save aria-hidden />
              {busy ? 'Saving…' : isDirty || isCreate ? 'Save draft' : 'Saved'}
            </Button>
            {invoice && (
              <Button disabled={busy} onClick={issue}>
                <FileCheck2 aria-hidden />
                {isDirty ? 'Save & issue' : 'Issue invoice'}
              </Button>
            )}
          </>
        }
      />

      {mutation.isError && (
        <InlineAlert>
          {invoiceErrorMessage(mutation.error, 'Couldn’t save the invoice.')}
        </InlineAlert>
      )}
      {fixFields.length > 0 && (
        <InlineAlert tone="info">
          Fill in the highlighted details, save the draft, then issue it again.
        </InlineAlert>
      )}

      <form
        id={FORM_ID}
        noValidate
        onSubmit={(event) => void save()(event)}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>
                {isCreate
                  ? 'Pick a contact or deal to fill in the bill-to details.'
                  : 'The contact and deal can’t be changed after the invoice is created.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="contactId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="field-contactId">Contact</FieldLabel>
                      <RecordCombobox
                        id="field-contactId"
                        items={contactItems}
                        value={field.value}
                        onValueChange={pickContact}
                        placeholder={contactsQuery.isPending ? 'Loading contacts…' : 'No contact'}
                        searchPlaceholder="Search contacts…"
                        emptyText="No contacts found."
                        invalid={fieldState.invalid}
                        disabled={!isCreate}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="dealId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="field-dealId">Deal</FieldLabel>
                      <RecordCombobox
                        id="field-dealId"
                        items={dealItems}
                        value={field.value}
                        onValueChange={pickDeal}
                        placeholder={dealsQuery.isPending ? 'Loading deals…' : 'No deal'}
                        searchPlaceholder="Search deals…"
                        emptyText={contactId ? 'No deals for this contact.' : 'No deals found.'}
                        invalid={fieldState.invalid}
                        disabled={!isCreate}
                      />
                      {isCreate && (
                        <FieldDescription>A deal can have only one invoice.</FieldDescription>
                      )}
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bill to</CardTitle>
              <CardDescription>
                Printed on the invoice. The PDF is emailed to this address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="billToName"
                  label="Name"
                  placeholder="Customer or company name"
                  fieldClassName="sm:col-span-2"
                />
                <div className="sm:col-span-2">
                  <FormTextarea
                    control={form.control}
                    name="billToAddress"
                    label="Address"
                    rows={3}
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="billToGstin"
                  label="GSTIN"
                  placeholder="Optional, for registered businesses"
                  className="uppercase"
                  autoComplete="off"
                />
                <FormSelect
                  control={form.control}
                  name="placeOfSupply"
                  label="Place of supply"
                  options={stateOptions}
                  placeholder="Select state…"
                  description={
                    suggestState ? (
                      <button
                        type="button"
                        className="underline-offset-4 hover:text-foreground hover:underline"
                        onClick={() => {
                          form.setValue('placeOfSupply', gstinState, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        Use {gstStateName(gstinState)} (from the GSTIN)
                      </button>
                    ) : placeOfSupply && sellerState ? (
                      placeOfSupply === sellerState ? (
                        'Same state as you: CGST + SGST.'
                      ) : (
                        'Different state from yours: IGST.'
                      )
                    ) : undefined
                  }
                />
                <FormInput
                  control={form.control}
                  name="billToEmail"
                  label="Email"
                  type="email"
                  autoComplete="off"
                />
                <FormInput
                  control={form.control}
                  name="billToPhone"
                  label="Phone"
                  type="tel"
                  autoComplete="off"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                Unit prices in rupees.{' '}
                {profile?.defaultSac
                  ? `Empty SAC codes use your default (${profile.defaultSac}).`
                  : 'Every line needs a SAC code before the invoice can be issued.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSwitch
                control={form.control}
                name="pricesIncludeGst"
                label="Prices include GST"
                description="Turn on when the unit prices already contain the tax."
              />
              {lines.fields.length === 0 && (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No lines yet. Add one to bill the customer.
                </p>
              )}
              {lines.fields.map((line, index) => (
                <LineRow
                  key={line.id}
                  control={form.control}
                  index={index}
                  onRemove={() => {
                    lines.remove(index);
                  }}
                  sellerState={sellerState}
                />
              ))}
              {linesError?.message && (
                <p role="alert" className="text-sm text-destructive">
                  {linesError.message}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <CataloguePicker onPick={addProduct} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    lines.append(emptyLine(profile));
                  }}
                >
                  <Plus aria-hidden />
                  Add line
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="dueDate"
                label="Due date"
                type="date"
                description={
                  profile ? `Defaults to ${profile.paymentTermsDays} days after today.` : undefined
                }
              />
              <div className="sm:col-span-2">
                <FormTextarea
                  control={form.control}
                  name="notes"
                  label="Notes"
                  rows={3}
                  placeholder="Shown on the invoice, e.g. booking reference"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <SummaryCard
            control={form.control}
            invoice={invoice}
            isDirty={isDirty}
            sellerState={sellerState}
          />
          <Card size="sm">
            <CardHeader>
              <CardTitle>Seller</CardTitle>
              <CardDescription>From your billing profile, frozen when issued.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile && (
                <div className="space-y-0.5">
                  <p className="font-medium">{profile.legalName || 'No legal name yet'}</p>
                  {profile.gstin && <p className="text-muted-foreground">GSTIN {profile.gstin}</p>}
                  {profile.stateCode && (
                    <p className="text-muted-foreground">
                      {gstStateName(profile.stateCode)} ({profile.stateCode})
                    </p>
                  )}
                </div>
              )}
              {profileReady && profileIncomplete(profile) && (
                <InlineAlert>
                  The billing profile is incomplete, so issuing will fail until it has your legal
                  name, GSTIN, state and address.
                </InlineAlert>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to={invoicePaths.settings}>
                  <Settings2 aria-hidden />
                  Billing profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}

interface LineRowProps {
  control: Control<InvoiceFormValues>;
  index: number;
  onRemove: () => void;
  sellerState: string;
}

function LineRow({ control, index, onRemove, sellerState }: LineRowProps) {
  const [line, pricesIncludeGst, placeOfSupply] = useWatch({
    control,
    name: [`lines.${index}`, 'pricesIncludeGst', 'placeOfSupply'],
  });
  const estimate = estimateInvoice((line as InvoiceLineFormValues | undefined) ? [line] : [], {
    pricesIncludeGst,
    interState: Boolean(placeOfSupply && sellerState && placeOfSupply !== sellerState),
  });
  return (
    <fieldset className="space-y-3 rounded-lg border p-3">
      <legend className="sr-only">Line {index + 1}</legend>
      <div className="flex items-start gap-2">
        <FormInput
          control={control}
          name={`lines.${index}.description`}
          label={`Line ${index + 1}`}
          placeholder="e.g. Goa 4N/5D package for 2 adults"
          fieldClassName="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove line ${index + 1}`}
          className="mt-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormInput
          control={control}
          name={`lines.${index}.quantity`}
          label="Qty"
          inputMode="numeric"
        />
        <FormInput
          control={control}
          name={`lines.${index}.unitPrice`}
          label="Unit price (₹)"
          inputMode="decimal"
        />
        <FormInput
          control={control}
          name={`lines.${index}.sac`}
          label="SAC"
          inputMode="numeric"
          placeholder="Default"
        />
        <FormSelect
          control={control}
          name={`lines.${index}.gstRateBp`}
          label="GST"
          options={rateOptions}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground tabular-nums">
        Taxable {formatPaise(estimate.taxablePaise)} + GST{' '}
        {formatPaise(estimate.lines[0]?.taxPaise ?? 0)} ={' '}
        <span className="font-medium text-foreground">
          {formatPaise(estimate.lines[0]?.totalPaise ?? 0)}
        </span>
      </p>
    </fieldset>
  );
}

interface SummaryCardProps {
  control: Control<InvoiceFormValues>;
  invoice?: Invoice;
  isDirty: boolean;
  sellerState: string;
}

/** Saved server totals when the form matches the draft; otherwise a live estimate. */
function SummaryCard({ control, invoice, isDirty, sellerState }: SummaryCardProps) {
  const [lines, pricesIncludeGst, placeOfSupply] = useWatch({
    control,
    name: ['lines', 'pricesIncludeGst', 'placeOfSupply'],
  });
  const interState = Boolean(placeOfSupply && sellerState && placeOfSupply !== sellerState);
  const estimate = estimateInvoice(lines, { pricesIncludeGst, interState });
  const showSaved = invoice && !isDirty;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{showSaved ? 'Totals' : 'Estimated totals'}</CardTitle>
        <CardDescription>
          {showSaved
            ? 'As calculated by the server for this draft.'
            : 'An estimate while you edit. The figures on the saved invoice are final.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {showSaved ? (
          <InvoiceTotals {...invoice} interState={invoice.interState} />
        ) : (
          <InvoiceTotals {...estimate} interState={interState} />
        )}
        {!placeOfSupply && (
          <p className="text-xs text-muted-foreground">
            Pick the place of supply to choose between CGST + SGST and IGST.
          </p>
        )}
        {placeOfSupply && !sellerState && (
          <p className="text-xs text-muted-foreground">
            Set your state in the billing profile to work out CGST + SGST or IGST.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
