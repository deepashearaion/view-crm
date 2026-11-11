import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAccess } from '@/features/auth';
import { formatDate } from '@/lib/format';
import { applyProblem, errorMessage } from '@/services';

import { automationProblemCode } from '../constants';
import {
  useCreateWhatsAppAccount,
  useDeleteWhatsAppAccount,
  useWhatsAppAccounts,
} from '../hooks/use-automation';
import { whatsAppAccountSchema, type WhatsAppAccountFormValues } from '../schemas';
import type { WhatsAppAccount } from '../types';

import { QueryError, TableSkeleton } from './shared';

const FORM_ID = 'whatsapp-account-form';
const EMPTY: WhatsAppAccountFormValues = {
  phoneNumberId: '',
  displayPhone: '',
  sourceName: 'WhatsApp',
};

function AddWhatsAppAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateWhatsAppAccount();
  const form = useForm<WhatsAppAccountFormValues>({
    resolver: zodResolver(whatsAppAccountSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      form.reset(EMPTY);
      create.reset();
    }
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(
      {
        phone_number_id: values.phoneNumberId,
        display_phone: values.displayPhone,
        source_name: values.sourceName,
      },
      {
        onSuccess: (account) => {
          toast.success(`${account.displayPhone} connected.`);
          onOpenChange(false);
        },
        onError: (error) => {
          applyProblem(
            error,
            (field, fieldError) => {
              form.setError(field as keyof WhatsAppAccountFormValues, fieldError);
            },
            {
              phone_number_id: 'phoneNumberId',
              display_phone: 'displayPhone',
              source_name: 'sourceName',
            },
          );
          if (automationProblemCode(error) === 'phone_number_taken') {
            form.setError('phoneNumberId', {
              type: 'server',
              message: 'This phone number is already connected.',
            });
          }
        },
      },
    );
  });

  const showAlert = create.isError && automationProblemCode(create.error) !== 'phone_number_taken';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a WhatsApp number</DialogTitle>
          <DialogDescription>
            Use the details of your WhatsApp Business number from Meta’s WhatsApp Manager. Messages
            to this number create or update leads.
          </DialogDescription>
        </DialogHeader>
        <form
          id={FORM_ID}
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          {showAlert && (
            <InlineAlert>{errorMessage(create.error, 'Couldn’t connect the number.')}</InlineAlert>
          )}
          <FormInput
            control={form.control}
            name="phoneNumberId"
            label="Phone number ID"
            inputMode="numeric"
            placeholder="e.g. 106540352242922"
            description="Shown under API Setup in Meta; not the phone number itself."
            autoFocus
          />
          <FormInput
            control={form.control}
            name="displayPhone"
            label="Display number"
            type="tel"
            placeholder="e.g. +91 98765 43210"
          />
          <FormInput
            control={form.control}
            name="sourceName"
            label="Source name"
            description="Recorded as the source of leads that message this number."
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
          <Button type="submit" form={FORM_ID} disabled={create.isPending}>
            {create.isPending ? 'Connecting…' : 'Connect number'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WhatsAppTab() {
  const canEdit = useAccess().can('settings', 'edit');
  const { data: accounts = [], isPending, error, refetch } = useWhatsAppAccounts();
  const remove = useDeleteWhatsAppAccount();
  const [adding, setAdding] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<WhatsAppAccount | null>(null);

  const addButton = canEdit && (
    <Button
      size="sm"
      onClick={() => {
        setAdding(true);
      }}
    >
      <Plus aria-hidden />
      Connect number
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp numbers</CardTitle>
        <CardDescription>
          Business numbers whose incoming messages become leads and conversation history.
        </CardDescription>
        {accounts.length > 0 && addButton && <CardAction>{addButton}</CardAction>}
      </CardHeader>
      <CardContent className="px-0">
        {isPending ? (
          <TableSkeleton label="Loading WhatsApp numbers" />
        ) : error ? (
          <QueryError
            error={error}
            title="Couldn’t load WhatsApp numbers"
            onRetry={() => void refetch()}
          />
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No WhatsApp numbers connected"
            description="Connect your WhatsApp Business number to capture leads from chats automatically."
            className="mx-4 border-none"
            actions={addButton || undefined}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Number</TableHead>
                <TableHead>Phone number ID</TableHead>
                <TableHead>Source name</TableHead>
                <TableHead>Connected</TableHead>
                <TableHead className="w-16 pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="pl-6 font-medium tabular-nums">
                    {account.displayPhone}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {account.phoneNumberId}
                  </TableCell>
                  <TableCell>{account.sourceName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(account.createdAt)}
                  </TableCell>
                  <TableCell className="pr-6">
                    {canEdit && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${account.displayPhone}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setPendingRemove(account);
                          }}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AddWhatsAppAccountDialog open={adding} onOpenChange={setAdding} />
      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
        title={`Remove ${pendingRemove?.displayPhone ?? 'this number'}?`}
        description="Messages to this number will no longer create leads. Existing leads and conversations are kept."
        confirmLabel="Remove"
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (!pendingRemove) return;
          remove.mutate(pendingRemove.id, {
            onSuccess: () => {
              toast.success('WhatsApp number removed.');
              setPendingRemove(null);
            },
            onError: (err) => {
              toast.error(errorMessage(err, 'Couldn’t remove the number.'));
            },
          });
        }}
      />
    </Card>
  );
}
