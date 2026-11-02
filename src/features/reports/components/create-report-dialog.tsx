import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { errorMessage } from '@/services';

import { REPORT_MODULES, REPORT_TYPES } from '../constants';
import { useCreateReport } from '../hooks/use-reports';
import { reportFormSchema } from '../schemas';
import type { ReportFormValues } from '../types';

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReportDialog({ open, onOpenChange }: CreateReportDialogProps) {
  const createReport = useCreateReport();
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { name: '', module: 'Deals', type: 'bar', description: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    createReport.mutate(values, {
      onSuccess: (report) => {
        toast.success(`Report “${report.name}” saved.`);
        form.reset();
        onOpenChange(false);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New report</DialogTitle>
          <DialogDescription>Save a report definition for your team.</DialogDescription>
        </DialogHeader>
        <form id="report-form" onSubmit={(event) => void onSubmit(event)} noValidate>
          <FieldGroup>
            {createReport.isError && (
              <InlineAlert>
                {errorMessage(createReport.error, 'Couldn’t save the report.')}
              </InlineAlert>
            )}
            <FormInput control={form.control} name="name" label="Report name" autoFocus />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                name="module"
                label="Module"
                options={optionsFrom(REPORT_MODULES)}
              />
              <FormSelect
                control={form.control}
                name="type"
                label="Visualisation"
                options={REPORT_TYPES.map((type) => ({ value: type.value, label: type.label }))}
              />
            </div>
            <FormTextarea control={form.control} name="description" label="Description" rows={3} />
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
          <Button type="submit" form="report-form" disabled={createReport.isPending}>
            {createReport.isPending ? 'Saving…' : 'Save report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
