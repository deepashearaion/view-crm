import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Lock, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { FormSwitch } from '@/components/form/form-switch';
import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccess } from '@/features/auth';
import { bpToPercent, formatDateTime } from '@/lib/format';
import { applyProblem, errorMessage } from '@/services';

import {
  BILLING_PROFILE_FIELD_MAP,
  billingProfileFormToDto,
  billingProfileToFormValues,
} from '../api/form-mapping';
import { GST_RATES_BP, GST_STATES, invoicePaths } from '../constants';
import { useBillingProfile, useUpdateBillingProfile } from '../hooks/use-billing-profile';
import { billingProfileFormSchema } from '../schemas';
import type { BillingProfileFormOutput, BillingProfileFormValues } from '../types';

const FORM_ID = 'billing-profile-form';
const FIX_MESSAGE = 'Needed to issue invoices.';

const stateOptions: SelectOption[] = GST_STATES.map((state) => ({
  value: state.code,
  label: `${state.code} · ${state.name}`,
}));
const rateOptions: SelectOption[] = GST_RATES_BP.map((bp) => ({
  value: String(bp),
  label: `${bpToPercent(bp)}%`,
}));

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading billing profile">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-56 rounded-xl" />
      ))}
    </div>
  );
}

export default function BillingProfilePage() {
  const canManage = useAccess().can('settings', 'edit');
  const { data: profile, isPending, error, refetch } = useBillingProfile();
  const updateProfile = useUpdateBillingProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const fix = searchParams.get('fix') ?? '';

  const form = useForm<BillingProfileFormValues, unknown, BillingProfileFormOutput>({
    resolver: zodResolver(billingProfileFormSchema),
    defaultValues: billingProfileToFormValues(),
  });
  const invoicePrefix = useWatch({ control: form.control, name: 'invoicePrefix' });
  const { isDirty } = form.formState;

  useEffect(() => {
    if (profile) form.reset(billingProfileToFormValues(profile));
  }, [profile, form]);

  // Highlight what a failed issue said was missing (?fix=gstin,state_code).
  const fixFields = useMemo(() => fix.split(',').filter(Boolean), [fix]);
  useEffect(() => {
    if (!profile || !canManage) return;
    fixFields.forEach((apiField, index) => {
      const name = BILLING_PROFILE_FIELD_MAP[apiField];
      if (name)
        form.setError(name, { type: 'server', message: FIX_MESSAGE }, { shouldFocus: index === 0 });
    });
  }, [profile, canManage, fixFields, form]);

  const onSubmit = form.handleSubmit((values) => {
    updateProfile.mutate(billingProfileFormToDto(values), {
      onSuccess: () => {
        toast.success('Billing profile saved.');
        if (fix)
          setSearchParams(
            (params) => {
              params.delete('fix');
              return params;
            },
            { replace: true },
          );
      },
      onError: (mutationError) => {
        applyProblem(
          mutationError,
          (field, fieldError) => {
            form.setError(field as keyof BillingProfileFormValues, fieldError);
          },
          BILLING_PROFILE_FIELD_MAP,
        );
      },
    });
  });

  const preview = `${(invoicePrefix || 'INV').toUpperCase()}/26-27/0001`;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Billing profile"
        description="Your business details, printed as the seller on every invoice and frozen into each one when it’s issued."
        badges={
          !canManage && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock aria-hidden className="size-3.5" />
              Read-only
            </span>
          )
        }
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link to={invoicePaths.list}>
                <ArrowLeft aria-hidden />
                Invoices
              </Link>
            </Button>
            {canManage && profile && (
              <Button type="submit" form={FORM_ID} disabled={updateProfile.isPending || !isDirty}>
                <Save aria-hidden />
                {updateProfile.isPending ? 'Saving…' : 'Save profile'}
              </Button>
            )}
          </>
        }
      />

      {isPending ? (
        <ProfileSkeleton />
      ) : error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn’t load the billing profile"
          description={errorMessage(error, 'Please try again.')}
          actions={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <form
          id={FORM_ID}
          noValidate
          onSubmit={(event) => void onSubmit(event)}
          className="space-y-6"
        >
          {!canManage && (
            <InlineAlert tone="info">
              Only people who can edit settings can change the billing profile.
            </InlineAlert>
          )}
          {canManage && fixFields.length > 0 && (
            <InlineAlert tone="info">
              Fill in the highlighted details and save, then issue the invoice again.
            </InlineAlert>
          )}
          {updateProfile.isError && (
            <InlineAlert>
              {errorMessage(updateProfile.error, 'Couldn’t save the billing profile.')}
            </InlineAlert>
          )}
          <fieldset disabled={!canManage} className="contents">
            <Card>
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>
                  Legal name, GSTIN, state and address are required to issue invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="legalName"
                  label="Legal name"
                  fieldClassName="sm:col-span-2"
                />
                <FormInput
                  control={form.control}
                  name="gstin"
                  label="GSTIN"
                  placeholder="27ABCDE1234F1Z5"
                  className="uppercase"
                  autoComplete="off"
                />
                <FormSelect
                  control={form.control}
                  name="stateCode"
                  label="State"
                  options={stateOptions}
                  placeholder="Select state…"
                  disabled={!canManage}
                  description="Same state as the customer’s place of supply → CGST + SGST; otherwise IGST."
                />
                <div className="sm:col-span-2">
                  <FormTextarea control={form.control} name="address" label="Address" rows={3} />
                </div>
                <FormInput control={form.control} name="email" label="Email" type="email" />
                <FormInput control={form.control} name="phone" label="Phone" type="tel" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice defaults</CardTitle>
                <CardDescription>
                  Used for new invoices and lines; each can be changed per invoice.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="invoicePrefix"
                  label="Invoice prefix"
                  className="uppercase"
                  maxLength={5}
                  description={`1–5 letters or digits. Numbers look like ${preview}.`}
                />
                <FormInput
                  control={form.control}
                  name="paymentTermsDays"
                  label="Payment terms (days)"
                  inputMode="numeric"
                  description="Sets the default due date."
                />
                <FormInput
                  control={form.control}
                  name="defaultSac"
                  label="Default SAC"
                  inputMode="numeric"
                  placeholder="e.g. 998555"
                  description="Used for lines without their own SAC code."
                />
                <FormSelect
                  control={form.control}
                  name="defaultGstRateBp"
                  label="Default GST rate"
                  options={rateOptions}
                  disabled={!canManage}
                />
                <div className="sm:col-span-2">
                  <FormSwitch
                    control={form.control}
                    name="pricesIncludeGst"
                    label="Prices include GST"
                    description="New invoices treat unit prices as tax-inclusive."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment and terms</CardTitle>
                <CardDescription>Printed at the foot of every invoice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormTextarea
                  control={form.control}
                  name="bankDetails"
                  label="Bank details"
                  rows={4}
                  placeholder={'Account name\nAccount number\nIFSC\nUPI ID'}
                />
                <FormTextarea control={form.control} name="terms" label="Terms" rows={4} />
              </CardContent>
            </Card>
          </fieldset>
          {profile.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Last updated {formatDateTime(profile.updatedAt)}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
