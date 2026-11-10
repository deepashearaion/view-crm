import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
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
import { applyProblem, errorMessage } from '@/services';

import { LEAD_SOURCE_CHANNELS, automationProblemCode } from '../constants';
import { useCreateLeadSource, useUpdateLeadSource } from '../hooks/use-automation';
import { leadSourceSchema, type LeadSourceFormValues } from '../schemas';
import type { LeadSource } from '../types';

const FORM_ID = 'lead-source-form';

interface LeadSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Source to rename; omitted to add one. */
  source?: LeadSource;
}

export function LeadSourceDialog({ open, onOpenChange, source }: LeadSourceDialogProps) {
  const create = useCreateLeadSource();
  const update = useUpdateLeadSource();
  const mutation = source ? update : create;

  const form = useForm<LeadSourceFormValues>({
    resolver: zodResolver(leadSourceSchema),
    defaultValues: { name: '', channel: 'web_form' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: source?.name ?? '', channel: source?.channel ?? 'web_form' });
      create.reset();
      update.reset();
    }
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onError = (error: unknown) => {
    applyProblem(error, (field, fieldError) => {
      form.setError(field as keyof LeadSourceFormValues, fieldError);
    });
    if (automationProblemCode(error) === 'name_taken') {
      form.setError('name', { type: 'server', message: 'A source with this name already exists.' });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    if (source) {
      update.mutate(
        { id: source.id, body: { name: values.name } },
        {
          onSuccess: () => {
            toast.success('Lead source renamed.');
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(values, {
        onSuccess: (created) => {
          toast.success(
            created.channel === 'web_form'
              ? `${created.name} added. Copy its form snippet to your website.`
              : `${created.name} added.`,
          );
          onOpenChange(false);
        },
        onError,
      });
    }
  });

  const showAlert = mutation.isError && automationProblemCode(mutation.error) !== 'name_taken';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{source ? 'Rename lead source' : 'Add lead source'}</DialogTitle>
          <DialogDescription>
            {source
              ? 'The new name is used as the source of leads from now on.'
              : 'Leads that come in through this source are tagged with its name.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id={FORM_ID}
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          {showAlert && (
            <InlineAlert>{errorMessage(mutation.error, 'Couldn’t save the source.')}</InlineAlert>
          )}
          <FormInput
            control={form.control}
            name="name"
            label="Name"
            placeholder="e.g. Website contact form"
            autoFocus
          />
          <FormSelect
            control={form.control}
            name="channel"
            label="Channel"
            options={LEAD_SOURCE_CHANNELS}
            disabled={Boolean(source)}
            description={
              source
                ? 'The channel can’t be changed.'
                : 'Web form gives you a public URL and an HTML snippet for your website.'
            }
          />
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
          <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : source ? 'Rename' : 'Add source'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
