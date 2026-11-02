import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { UserChip } from '@/components/data/user-chip';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionUser, useUserLookup } from '@/features/auth';
import type { RecordSheetState } from '@/hooks/use-record-sheet-state';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { errorMessage } from '@/services';

import { companyToFormValues, formValuesToDto } from '../api/companies';
import {
  useCompany,
  useCreateCompany,
  useCustomFields,
  useDeleteCompanies,
  useUpdateCompany,
} from '../hooks/use-companies';
import { companyFormSchema } from '../schemas';
import type { Company, CompanyFormOutput, CompanyFormValues } from '../types';

import { CompanyForm } from './company-form';
import { CompanyStatusBadge } from './company-status-badge';

export type CompanySheetState = RecordSheetState;

const FORM_ID = 'company-form';

function Detail({ label, children }: { label: string; children: ReactNode }) {
  const empty = children === '' || children === null || children === undefined;
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">
        {empty ? <span className="text-muted-foreground">—</span> : children}
      </dd>
    </div>
  );
}

function ExternalLink({ href }: { href: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-primary underline-offset-4 hover:underline"
    >
      {href.replace(/^https?:\/\/(www\.)?/, '')}
    </a>
  );
}

function CompanyDetails({ company }: { company: Company }) {
  const users = useUserLookup();
  const { data: customFields = [] } = useCustomFields();
  const address = [company.address, company.city, company.state, company.zipcode, company.country]
    .filter(Boolean)
    .join(', ');
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {company.mobile && (
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${company.mobile.replace(/\s/g, '')}`}>
              <Phone aria-hidden />
              Call
            </a>
          </Button>
        )}
        {company.email && (
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${company.email}`}>
              <Mail aria-hidden />
              Email
            </a>
          </Button>
        )}
        {company.website && (
          <Button variant="outline" size="sm" asChild>
            <a href={company.website} target="_blank" rel="noreferrer noopener">
              <Globe aria-hidden />
              Website
            </a>
          </Button>
        )}
      </div>
      <dl className="divide-y">
        <Detail label="Owner">
          <UserChip name={company.ownerId ? users.get(company.ownerId)?.name : undefined} />
        </Detail>
        <Detail label="Email">{company.email}</Detail>
        <Detail label="Phone">{company.mobile}</Detail>
        <Detail label="Employees">{company.employees?.toLocaleString('en-IN') ?? ''}</Detail>
        <Detail label="Annual revenue">
          {company.annualRevenue === null ? '' : formatCurrency(company.annualRevenue)}
        </Detail>
        <Detail label="Lead source">{company.leadSource}</Detail>
        <Detail label="Address">{address}</Detail>
        <Detail label="LinkedIn">
          <ExternalLink href={company.linkedin} />
        </Detail>
        <Detail label="Instagram">
          <ExternalLink href={company.instagram} />
        </Detail>
        <Detail label="Opt-outs">
          {[company.emailOptOut && 'Email', company.smsOptOut && 'SMS']
            .filter(Boolean)
            .join(', ') || 'None'}
        </Detail>
        {customFields.map((field) => {
          const value = company.customFields[field.id];
          return (
            <Detail key={field.id} label={field.label}>
              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value ?? '')}
            </Detail>
          );
        })}
        <Detail label="Created">{formatDateTime(company.createdAt)}</Detail>
        <Detail label="Modified">{formatDateTime(company.updatedAt)}</Detail>
      </dl>
      {company.description && (
        <section className="space-y-1.5">
          <h3 className="text-sm font-medium">Description</h3>
          <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
            {company.description}
          </p>
        </section>
      )}
    </div>
  );
}

interface CompanySheetProps {
  state: CompanySheetState;
  onStateChange: (state: CompanySheetState) => void;
}

export function CompanySheet({ state, onStateChange }: CompanySheetProps) {
  const sessionUser = useSessionUser();
  const companyId = state.mode === 'view' || state.mode === 'edit' ? state.id : null;
  const companyQuery = useCompany(companyId);
  const company = companyQuery.data;
  const { data: customFields = [] } = useCustomFields();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompanies = useDeleteCompanies();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const defaultOwner = sessionUser?.id === undefined ? '' : String(sessionUser.id);
  const form = useForm<CompanyFormValues, unknown, CompanyFormOutput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: companyToFormValues(undefined, defaultOwner),
  });

  const isEditing = state.mode === 'edit' || state.mode === 'create';

  useEffect(() => {
    if (state.mode === 'create') form.reset(companyToFormValues(undefined, defaultOwner));
    if (state.mode === 'edit' && company) form.reset(companyToFormValues(company));
  }, [state.mode, company, defaultOwner, form]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };
  const mutation = state.mode === 'create' ? createCompany : updateCompany;

  const onSubmit = form.handleSubmit((values) => {
    const body = formValuesToDto(values);
    if (state.mode === 'create') {
      createCompany.mutate(body, {
        onSuccess: (created) => {
          toast.success(`${created.name} added.`);
          onStateChange({ mode: 'view', id: created.id });
        },
      });
    } else if (state.mode === 'edit') {
      updateCompany.mutate(
        { id: state.id, body },
        {
          onSuccess: (updated) => {
            toast.success('Company updated.');
            onStateChange({ mode: 'view', id: updated.id });
          },
        },
      );
    }
  });

  const title =
    state.mode === 'create'
      ? 'New company'
      : (company?.name ?? (companyQuery.isPending ? 'Loading…' : 'Company'));

  return (
    <>
      <Sheet
        open={state.mode !== 'closed'}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b p-6 pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-lg">{title}</SheetTitle>
              {company && state.mode === 'view' && <CompanyStatusBadge status={company.status} />}
            </div>
            <SheetDescription>
              {state.mode === 'create'
                ? 'Add an organisation you sell to.'
                : state.mode === 'edit'
                  ? 'Update the company’s details.'
                  : company
                    ? [company.city, company.country].filter(Boolean).join(', ') || 'Company'
                    : ' '}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-6">
              {companyQuery.isError && state.mode !== 'create' ? (
                <InlineAlert>
                  {errorMessage(companyQuery.error, 'Couldn’t load this company.')}
                </InlineAlert>
              ) : isEditing ? (
                <form
                  id={FORM_ID}
                  onSubmit={(event) => void onSubmit(event)}
                  noValidate
                  className="space-y-6"
                >
                  {mutation.isError && (
                    <InlineAlert>
                      {errorMessage(mutation.error, 'Couldn’t save the company.')}
                    </InlineAlert>
                  )}
                  <CompanyForm control={form.control} customFields={customFields} />
                </form>
              ) : company ? (
                <CompanyDetails company={company} />
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-6" />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />
          <SheetFooter className="flex-row justify-between gap-2 p-4">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (state.mode === 'edit') onStateChange({ mode: 'view', id: state.id });
                    else close();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
                  {mutation.isPending
                    ? 'Saving…'
                    : state.mode === 'create'
                      ? 'Create company'
                      : 'Save changes'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={!company}
                  onClick={() => {
                    setConfirmDelete(true);
                  }}
                >
                  <Trash2 aria-hidden />
                  Delete
                </Button>
                <Button
                  disabled={!company}
                  onClick={() => {
                    if (companyId) onStateChange({ mode: 'edit', id: companyId });
                  }}
                >
                  <Pencil aria-hidden />
                  Edit
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this company?"
        description={`${company?.name ?? 'This company'} will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        pending={deleteCompanies.isPending}
        onConfirm={() => {
          if (!companyId) return;
          deleteCompanies.mutate([companyId], {
            onSuccess: ({ failed }) => {
              setConfirmDelete(false);
              if (failed.length) {
                toast.error('Couldn’t delete this company. Please try again.');
                return;
              }
              toast.success('Company deleted.');
              close();
            },
          });
        }}
      />
    </>
  );
}
