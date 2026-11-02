import { zodResolver } from '@hookform/resolvers/zod';
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
import { FieldGroup } from '@/components/ui/field';
import { errorMessage } from '@/services';

import { CUSTOM_FIELD_TYPES } from '../constants';
import { useCreateCustomField } from '../hooks/use-companies';
import { customFieldSchema } from '../schemas';
import type { CustomFieldFormValues } from '../types';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Creates a custom company field (shown in the form and as an optional column). */
export function AddFieldDialog({ open, onOpenChange }: AddFieldDialogProps) {
  const createField = useCreateCustomField();
  const form = useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: { label: '', type: 'text' },
  });

  const onSubmit = form.handleSubmit((values) => {
    createField.mutate(values, {
      onSuccess: (field) => {
        toast.success(`Field “${field.label}” added.`);
        form.reset();
        onOpenChange(false);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add custom field</DialogTitle>
          <DialogDescription>
            Track extra information on every company, like industry or GSTIN.
          </DialogDescription>
        </DialogHeader>
        <form id="add-field-form" onSubmit={(event) => void onSubmit(event)} noValidate>
          <FieldGroup>
            {createField.isError && (
              <InlineAlert>
                {errorMessage(createField.error, 'Couldn’t add the field.')}
              </InlineAlert>
            )}
            <FormInput control={form.control} name="label" label="Field name" autoFocus />
            <FormSelect
              control={form.control}
              name="type"
              label="Type"
              options={CUSTOM_FIELD_TYPES.map((type) => ({ value: type.value, label: type.label }))}
            />
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
          <Button type="submit" form="add-field-form" disabled={createField.isPending}>
            {createField.isPending ? 'Adding…' : 'Add field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
