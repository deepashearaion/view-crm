import { Copy, Eye, Lock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DataTableRowActions, type RowAction } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  useAccess,
  useDeleteRole,
  usePermissionCatalog,
  useRoles,
  type ModuleSpec,
  type Role,
} from '@/features/auth';
import { plural } from '@/lib/format';
import { hasProblemCode } from '@/services';

import { settingsErrorMessage } from '../errors';
import { modulesWithAccess } from '../permission-grid';
import type { RoleEditorState } from '../types';

import { RoleEditorSheet } from './role-editor-sheet';
import { ListSkeleton, QueryError } from './shared';

const MAX_CHIPS = 5;

function AccessSummary({ role, catalog }: { role: Role; catalog: ModuleSpec[] | undefined }) {
  const modules = modulesWithAccess(catalog, role.permissions);
  const total = catalog?.length;
  if (modules.length === 0) {
    return <span className="text-sm text-muted-foreground">No access</span>;
  }
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">
        Sees {modules.length}
        {total !== undefined && ` of ${String(total)}`} modules
      </p>
      <div className="flex flex-wrap gap-1">
        {modules.slice(0, MAX_CHIPS).map((item) => (
          <Badge
            key={item.module}
            variant="secondary"
            title={item.scope === 'own' ? `${item.label}: own records only` : item.label}
          >
            {item.label}
            {item.scope === 'own' && <span className="text-muted-foreground">· own</span>}
          </Badge>
        ))}
        {modules.length > MAX_CHIPS && (
          <Badge variant="outline">+{modules.length - MAX_CHIPS}</Badge>
        )}
      </div>
    </div>
  );
}

interface RolesTabProps {
  /** Switches to the Users tab (to move people off a role before deleting it). */
  onShowUsers?: () => void;
}

export function RolesTab({ onShowUsers }: RolesTabProps) {
  const access = useAccess();
  const canCreate = access.can('roles', 'create');
  const canEdit = access.can('roles', 'edit');
  const canDelete = access.can('roles', 'delete');

  const { data: roles = [], isPending, error, refetch } = useRoles({ enabled: true });
  const { data: catalog } = usePermissionCatalog({ enabled: true });
  const deleteRole = useDeleteRole();

  const [editor, setEditor] = useState<RoleEditorState>({ mode: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const open = (role: Role) => {
    setEditor({ mode: canEdit && !role.locked ? 'edit' : 'view', role });
  };

  const actionsFor = (role: Role): RowAction[] => {
    const actions: RowAction[] = [];
    if (canEdit && !role.locked) {
      actions.push({
        label: 'Edit',
        icon: Pencil,
        onSelect: () => {
          open(role);
        },
      });
    } else {
      actions.push({
        label: 'View',
        icon: Eye,
        onSelect: () => {
          open(role);
        },
      });
    }
    if (canCreate) {
      actions.push({
        label: 'Duplicate',
        icon: Copy,
        onSelect: () => {
          setEditor({ mode: 'create', source: role });
        },
      });
    }
    if (canDelete && !role.locked) {
      actions.push({
        label: 'Delete',
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onSelect: () => {
          setPendingDelete(role);
        },
      });
    }
    return actions;
  };

  const blockedDelete = pendingDelete !== null && pendingDelete.userCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">Roles</h2>
          <p className="text-sm text-muted-foreground">
            Each role decides, module by module, what people can view, create, edit and delete.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setEditor({ mode: 'create' });
            }}
          >
            <Plus aria-hidden />
            Create role
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isPending ? (
          <ListSkeleton label="Loading roles" />
        ) : error ? (
          <QueryError error={error} title="Couldn’t load roles" onRetry={() => void refetch()} />
        ) : roles.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No roles yet"
            description="Create a role to decide what your team can see and change."
            className="border-none"
          />
        ) : (
          <Table aria-label="Roles">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 pl-4 text-xs">Role</TableHead>
                <TableHead className="h-10 text-right text-xs">Users</TableHead>
                <TableHead className="h-10 text-xs">Access</TableHead>
                <TableHead className="h-10 w-12 pr-4 text-xs">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  onClick={(event) => {
                    if (event.target instanceof Element && event.target.closest('button')) return;
                    open(role);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && event.target === event.currentTarget) open(role);
                  }}
                >
                  <TableCell className="max-w-96 py-3 pl-4 align-top whitespace-normal">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      {role.locked && (
                        <Badge variant="outline">
                          <Lock aria-hidden />
                          Locked
                        </Badge>
                      )}
                    </div>
                    {role.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{role.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right align-top tabular-nums">
                    {role.userCount}
                  </TableCell>
                  <TableCell className="py-3 align-top whitespace-normal">
                    {role.locked ? (
                      <span className="text-sm text-muted-foreground">Everything</span>
                    ) : (
                      <AccessSummary role={role} catalog={catalog} />
                    )}
                  </TableCell>
                  <TableCell className="py-3 pr-4 text-right align-top">
                    <DataTableRowActions
                      label={`Actions for ${role.name}`}
                      actions={actionsFor(role)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <RoleEditorSheet
        state={editor}
        onClose={() => {
          setEditor({ mode: 'closed' });
        }}
      />

      <Dialog
        open={blockedDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move people off {pendingDelete?.name} first</DialogTitle>
            <DialogDescription>
              {plural(pendingDelete?.userCount ?? 0, 'person', 'people')}{' '}
              {pendingDelete?.userCount === 1 ? 'has' : 'have'} this role. Give them another role on
              the Users tab, then delete it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setPendingDelete(null);
              }}
            >
              Close
            </Button>
            {onShowUsers && (
              <Button
                onClick={() => {
                  setPendingDelete(null);
                  onShowUsers();
                }}
              >
                Go to Users
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null && !blockedDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDelete(null);
        }}
        title={`Delete the ${pendingDelete?.name ?? ''} role?`}
        description="Nobody has this role, so nothing else changes. This can’t be undone."
        confirmLabel="Delete role"
        destructive
        pending={deleteRole.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          const { id, name } = pendingDelete;
          deleteRole.mutate(id, {
            onSuccess: () => {
              toast.success(`Role ${name} deleted.`);
              setPendingDelete(null);
            },
            onError: (deleteError) => {
              toast.error(settingsErrorMessage(deleteError, 'Couldn’t delete the role.'));
              // Our user count was stale; refresh it.
              if (hasProblemCode(deleteError, 'role_in_use')) void refetch();
              setPendingDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
