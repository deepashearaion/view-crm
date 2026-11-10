import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { optionsFrom } from '@/components/form/options';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import {
  LEAD_SOURCES,
  TEMPERATURES,
  leadErrorMessage,
  useCreateLead,
  type CreateLeadResult,
  type LeadRequest,
} from '@/features/contacts';
import { applyProblem, errorMessage } from '@/services';

import { LEAD_CHANNELS } from '../constants';

import { captureLeadSchema, type CaptureLeadOutput, type CaptureLeadValues } from '../schemas';

const DEFAULT_VALUES: CaptureLeadValues = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  destination: '',
  source: '',
  channel: 'manual',
  message: '',
  notes: '',
};

/** API field → form field, for applyProblem. */
const FIELD_MAP: Record<string, FieldPath<CaptureLeadValues>> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  mobile: 'mobile',
  destination: 'destination',
  source: 'source',
  channel: 'channel',
  message: 'message',
  notes: 'notes',
};

const FORM_FIELDS = new Set<string>(Object.values(FIELD_MAP));

/** Leaves out fields that weren't filled in, as the leads endpoint expects. */
function toLeadRequest(values: CaptureLeadOutput): LeadRequest {
  const request: LeadRequest = { first_name: values.firstName, channel: values.channel };
  if (values.lastName) request.last_name = values.lastName;
  if (values.email) request.email = values.email;
  if (values.mobile) request.mobile = values.mobile;
  if (values.destination) request.destination = values.destination;
  if (values.source) request.source = values.source;
  if (values.message) request.message = values.message;
  if (values.notes) request.notes = values.notes;
  return request;
}

function toastResult({ lead, contact }: CreateLeadResult) {
  const temperature =
    TEMPERATURES.find((entry) => entry.id === lead.temperature)?.label ?? lead.temperature;
  const scoreLine = `Score ${String(lead.score)} · ${temperature}${
    lead.reasons.length ? ` (${lead.reasons.join(', ')})` : ''
  }`;
  if (lead.created)
    toast.success(`${contact.fullName} captured as a lead.`, { description: scoreLine });
  else
    toast.info(`Merged with existing contact ${contact.fullName}.`, {
      description: `${scoreLine}. The existing contact was updated and re-scored.`,
    });
}

interface CaptureLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new or merged contact's id after a successful capture. */
  onCaptured?: (contactId: string) => void;
}

/** Manual lead intake: POST /api/v1/leads scores, routes and de-duplicates the lead. */
export function CaptureLeadDialog({ open, onOpenChange, onCaptured }: CaptureLeadDialogProps) {
  const capture = useCreateLead();
  const form = useForm<CaptureLeadValues, unknown, CaptureLeadOutput>({
    resolver: zodResolver(captureLeadSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset } = form;
  const resetMutation = capture.reset;
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  const onSubmit = form.handleSubmit((values) => {
    capture.mutate(
      { lead: toLeadRequest(values), followUp: null },
      {
        onSuccess: (result) => {
          toastResult(result);
          onOpenChange(false);
          onCaptured?.(result.contact.id);
        },
        onError: (error) => {
          applyProblem(
            error,
            (field, fieldError) => {
              if (FORM_FIELDS.has(field))
                form.setError(field as FieldPath<CaptureLeadValues>, fieldError);
            },
            FIELD_MAP,
          );
        },
      },
    );
  });

  const formError = capture.error
    ? (leadErrorMessage(capture.error) ?? errorMessage(capture.error, 'Couldn’t capture the lead.'))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Capture lead</DialogTitle>
          <DialogDescription>
            The lead is scored and routed to an owner automatically. If the email or mobile matches
            an existing contact, the details are merged into it.
          </DialogDescription>
        </DialogHeader>

        <form
          id="capture-lead-form"
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="max-h-[60vh] overflow-y-auto pr-1"
        >
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="firstName"
                label="First name"
                autoComplete="off"
                autoFocus
              />
              <FormInput
                control={form.control}
                name="lastName"
                label="Last name"
                autoComplete="off"
              />
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                type="email"
                autoComplete="off"
              />
              <FormInput
                control={form.control}
                name="mobile"
                label="Mobile"
                type="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
                autoComplete="off"
              />
              <FormInput
                control={form.control}
                name="destination"
                label="Destination"
                placeholder="e.g. Goa"
              />
              <FormSelect
                control={form.control}
                name="source"
                label="Source"
                options={optionsFrom(LEAD_SOURCES)}
                allowEmpty
              />
              <FormSelect
                control={form.control}
                name="channel"
                label="Channel"
                options={LEAD_CHANNELS}
              />
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              First name and an email or mobile number are required.
            </p>
            <FormTextarea
              control={form.control}
              name="message"
              label="Message"
              description="What the lead asked for. Scoring rules can match words in it."
              rows={3}
            />
            <FormTextarea control={form.control} name="notes" label="Internal notes" rows={2} />
            {formError && <InlineAlert>{formError}</InlineAlert>}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" form="capture-lead-form" disabled={capture.isPending}>
            {capture.isPending ? 'Capturing…' : 'Capture lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
