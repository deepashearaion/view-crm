import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { lostReasonSchema } from '../schemas';
import type { LostReasonValues } from '../types';

interface LostReasonDialogProps {
  /** Deal being moved; null closes the dialog. */
  dealTitle: string | null;
  stageName: string;
  onCancel: () => void;
  onConfirm: (lostReason: string) => void;
}

/** Lost stages need a reason before POST /deals/{id}/stage. */
export function LostReasonDialog({
  dealTitle,
  stageName,
  onCancel,
  onConfirm,
}: LostReasonDialogProps) {
  const open = dealTitle !== null;
  const form = useForm<LostReasonValues>({
    resolver: zodResolver(lostReasonSchema),
    defaultValues: { lostReason: '' },
  });

  useEffect(() => {
    if (open) form.reset({ lostReason: '' });
  }, [open, form]);

  const onSubmit = form.handleSubmit((values) => {
    onConfirm(values.lostReason);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why was this deal lost?</DialogTitle>
          <DialogDescription>
            Moving “{dealTitle ?? ''}” to {stageName}. The reason is kept on the deal, and the
            contact goes into lost-deal nurture or gets a re-contact task in 30 days.
          </DialogDescription>
        </DialogHeader>
        <form id="lost-reason-form" onSubmit={(event) => void onSubmit(event)} noValidate>
          <FormTextarea
            control={form.control}
            name="lostReason"
            label="Lost reason"
            placeholder="e.g. Went with a cheaper competitor"
            rows={3}
            autoFocus
          />
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" form="lost-reason-form" variant="destructive">
            Mark as lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
