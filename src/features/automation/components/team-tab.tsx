import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { UserChip } from '@/components/data/user-chip';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  useInviteUser,
  useSessionUser,
  useUpdateUserRole,
  useUsers,
  type User,
  type UserRole,
} from '@/features/auth';
import { formatDate } from '@/lib/format';
import { applyProblem, errorMessage, hasProblemCode } from '@/services';

import { inviteUserSchema, type InviteUserFormValues } from '../schemas';

import { QueryError, TableSkeleton } from './shared';

const FORM_ID = 'invite-user-form';
const ROLE_OPTIONS = USER_ROLES.map((role) => ({ value: role, label: USER_ROLE_LABELS[role] }));
const EMPTY: InviteUserFormValues = { name: '', email: '', role: 'rep' };

const ROLE_HINTS: Record<UserRole, string> = {
  owner: 'Full access, including users and roles.',
  admin: 'Full access, including users and roles.',
  manager: 'All records and settings; can reassign.',
  rep: 'Only the records they own.',
  viewer: 'Sees everything, changes nothing.',
};

function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const invite = useInviteUser();
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: EMPTY,
  });
  const role = useWatch({ control: form.control, name: 'role' });

  useEffect(() => {
    if (open) {
      form.reset(EMPTY);
      invite.reset();
    }
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = form.handleSubmit((values) => {
    invite.mutate(values, {
      onSuccess: (user) => {
        toast.success(`Invitation sent to ${user.email}.`);
        onOpenChange(false);
      },
      onError: (error) => {
        applyProblem(error, (field, fieldError) => {
          form.setError(field as keyof InviteUserFormValues, fieldError);
        });
        if (hasProblemCode(error, 'email_taken')) {
          form.setError('email', {
            type: 'server',
            message: 'Someone with this email already has an account.',
          });
        }
      },
    });
  });

  const showAlert = invite.isError && !hasProblemCode(invite.error, 'email_taken');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They get an email with a link to set their password and sign in.
          </DialogDescription>
        </DialogHeader>
        <form
          id={FORM_ID}
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          {showAlert && (
            <InlineAlert>{errorMessage(invite.error, 'Couldn’t send the invitation.')}</InlineAlert>
          )}
          <FormInput control={form.control} name="name" label="Name" autoComplete="off" autoFocus />
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="off"
          />
          <FormSelect
            control={form.control}
            name="role"
            label="Role"
            options={ROLE_OPTIONS}
            description={ROLE_HINTS[role]}
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
          <Button type="submit" form={FORM_ID} disabled={invite.isPending}>
            <Mail aria-hidden />
            {invite.isPending ? 'Sending…' : 'Send invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleSelect({ user }: { user: User }) {
  const updateRole = useUpdateUserRole();
  return (
    <Select
      value={user.role}
      disabled={updateRole.isPending}
      onValueChange={(role) => {
        updateRole.mutate(
          { id: user.id, role: role as UserRole },
          {
            onSuccess: (updated) => {
              toast.success(`${updated.name} is now ${USER_ROLE_LABELS[updated.role]}.`);
            },
            onError: (error) => {
              toast.error(
                hasProblemCode(error, 'last_owner')
                  ? 'The organisation needs at least one owner. Make someone else owner first.'
                  : errorMessage(error, 'Couldn’t change the role.'),
              );
            },
          },
        );
      }}
    >
      <SelectTrigger className="h-8 w-36" aria-label={`Role of ${user.name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TeamTab() {
  const { data: users = [], isPending, error, refetch } = useUsers();
  const sessionUser = useSessionUser();
  const [inviting, setInviting] = useState(false);

  const inviteButton = (
    <Button
      size="sm"
      onClick={() => {
        setInviting(true);
      }}
    >
      <UserPlus aria-hidden />
      Invite user
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          Who can sign in and what they can do. Reps see only the records they own; viewers are
          read-only.
        </CardDescription>
        <CardAction>{inviteButton}</CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {isPending ? (
          <TableSkeleton label="Loading team" />
        ) : error ? (
          <QueryError error={error} title="Couldn’t load the team" onRetry={() => void refetch()} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teammates yet"
            description="Invite your team so leads can be routed to them."
            className="mx-4 border-none"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="pr-6">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6 font-medium">
                    <span className="flex items-center gap-2">
                      <UserChip name={user.name} />
                      {sessionUser?.id !== undefined && String(sessionUser.id) === user.id && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <RoleSelect user={user} />
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground">
                    {user.createdAt ? formatDate(user.createdAt) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <InviteUserDialog open={inviting} onOpenChange={setInviting} />
    </Card>
  );
}
