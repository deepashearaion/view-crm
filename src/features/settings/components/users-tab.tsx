import type { ColumnDef } from '@tanstack/react-table';
import { KeyRound, Pencil, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableRowActions,
  facetFilterFn,
} from '@/components/data/data-table';
import { SearchInput } from '@/components/data/search-input';
import { UserChip } from '@/components/data/user-chip';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useAccess,
  useAssignUserRole,
  useMe,
  useRoles,
  useUsers,
  type User,
} from '@/features/auth';
import { formatDate } from '@/lib/format';

import { OWNER_RULES, settingsErrorMessage } from '../errors';
import type { RoleOption } from '../types';

import { CreateUserDialog } from './create-user-dialog';
import { RenameUserDialog, ResetPasswordDialog } from './user-dialogs';

interface RoleCellProps {
  user: User;
  roles: RoleOption[];
  isSelf: boolean;
}

/** Inline role picker; changes apply on that user's next request. */
function RoleCell({ user, roles, isSelf }: RoleCellProps) {
  const assignRole = useAssignUserRole();
  const options = roles.some((role) => role.value === user.roleId)
    ? roles
    : [{ value: user.roleId, label: user.roleName }, ...roles];

  const select = (
    <Select
      value={user.roleId}
      disabled={isSelf || assignRole.isPending}
      onValueChange={(roleId) => {
        assignRole.mutate(
          { id: user.id, roleId },
          {
            onSuccess: (updated) => {
              toast.success(`${updated.name} is now ${updated.roleName}.`, {
                description: 'Takes effect on their next request.',
              });
            },
            onError: (error) => {
              toast.error(settingsErrorMessage(error, 'Couldn’t change the role.', OWNER_RULES));
            },
          },
        );
      }}
    >
      <SelectTrigger className="h-8 w-40" aria-label={`Role of ${user.name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!isSelf) return select;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Disabled controls don't fire pointer events, so the wrapper carries the tooltip. */}
        <span tabIndex={0} className="inline-flex rounded-lg">
          {select}
        </span>
      </TooltipTrigger>
      <TooltipContent>You can’t change your own role</TooltipContent>
    </Tooltip>
  );
}

interface ColumnOptions {
  meId: string | undefined;
  roles: RoleOption[];
  canEdit: boolean;
  onRename: (user: User) => void;
  onResetPassword: (user: User) => void;
}

function getUserColumns({
  meId,
  roles,
  canEdit,
  onRename,
  onResetPassword,
}: ColumnOptions): ColumnDef<User>[] {
  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      meta: { label: 'Name' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <UserChip name={row.original.name} />
          {row.original.id === meId && <Badge variant="outline">You</Badge>}
        </span>
      ),
    },
    {
      id: 'email',
      accessorKey: 'email',
      meta: { label: 'Email', className: 'text-muted-foreground' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      id: 'role',
      accessorKey: 'roleId',
      meta: { label: 'Role' },
      filterFn: facetFilterFn,
      enableGlobalFilter: false,
      sortingFn: (a, b) => a.original.roleName.localeCompare(b.original.roleName),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) =>
        canEdit ? (
          <RoleCell user={row.original} roles={roles} isSelf={row.original.id === meId} />
        ) : (
          <Badge variant="secondary">{row.original.roleName}</Badge>
        ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      meta: { label: 'Created', className: 'whitespace-nowrap text-muted-foreground' },
      enableGlobalFilter: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (row.original.createdAt ? formatDate(row.original.createdAt) : '—'),
    },
  ];

  if (canEdit) {
    columns.push({
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-12 text-right' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DataTableRowActions
          label={`Actions for ${row.original.name}`}
          actions={[
            {
              label: 'Rename',
              icon: Pencil,
              onSelect: () => {
                onRename(row.original);
              },
            },
            {
              label: 'Reset password',
              icon: KeyRound,
              onSelect: () => {
                onResetPassword(row.original);
              },
            },
          ]}
        />
      ),
    });
  }
  return columns;
}

export function UsersTab() {
  const access = useAccess();
  const canViewRoles = access.can('roles', 'view');
  const canCreate = access.can('users', 'create');
  const canEdit = access.can('users', 'edit');
  const meId = useMe().data?.user.id;

  const { data: users = [], isPending, error, refetch } = useUsers({ enabled: true });
  const { data: roleList } = useRoles({ enabled: canViewRoles });

  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);

  // Without roles.view, fall back to the roles people already have.
  const roles = useMemo<RoleOption[]>(() => {
    if (roleList) {
      return roleList.map((role) => ({
        value: role.id,
        label: role.name,
        description: role.description,
        locked: role.locked,
      }));
    }
    const seen = new Map<string, RoleOption>();
    for (const user of users) {
      if (!seen.has(user.roleId))
        seen.set(user.roleId, { value: user.roleId, label: user.roleName });
    }
    return [...seen.values()];
  }, [roleList, users]);

  const columns = useMemo(
    () =>
      getUserColumns({
        meId,
        roles,
        canEdit,
        onRename: setRenaming,
        onResetPassword: setResetting,
      }),
    [meId, roles, canEdit],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Who can sign in, and which role decides what they can see and change.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setCreating(true);
            }}
          >
            <UserPlus aria-hidden />
            Create user
          </Button>
        )}
      </div>

      <DataTable
        label="Users"
        storageKey="settings-users"
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        toolbar={(table) => (
          <>
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search users…" />
            <DataTableFacetedFilter
              column={table.getColumn('role')}
              title="Role"
              options={roles.map((role) => ({ value: role.value, label: role.label }))}
            />
          </>
        )}
        emptyState={
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Create accounts for your team so leads can be routed to them."
            className="border-none"
          />
        }
      />

      {canCreate && <CreateUserDialog open={creating} onOpenChange={setCreating} roles={roles} />}
      <RenameUserDialog
        user={renaming}
        onClose={() => {
          setRenaming(null);
        }}
      />
      <ResetPasswordDialog
        user={resetting}
        onClose={() => {
          setResetting(null);
        }}
      />
    </div>
  );
}
