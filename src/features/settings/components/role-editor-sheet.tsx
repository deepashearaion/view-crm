import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  normalisePermissions,
  useCreateRole,
  useMe,
  usePermissionCatalog,
  useUpdateRole,
  type Permissions,
} from '@/features/auth';
import { plural } from '@/lib/format';
import { applyProblem, hasProblemCode } from '@/services';

import { settingsErrorMessage } from '../errors';
import { roleDetailsSchema, type RoleDetailsFormValues } from '../schemas';
import type { RoleEditorState } from '../types';

import { PermissionGrid } from './permission-grid';
import { QueryError } from './shared';

const FORM_ID = 'role-editor-form';

type OpenState = Exclude<RoleEditorState, { mode: 'closed' }>;

function initialValues(state: OpenState): RoleDetailsFormValues & { permissions: Permissions } {
  if (state.mode === 'create') {
    const source = state.source;
    return source
      ? {
          name: `Copy of ${source.name}`.slice(0, 60),
          description: source.description,
          permissions: source.permissions,
        }
      : { name: '', description: '', permissions: {} };
  }
  return {
    name: state.role.name,
    description: state.role.description,
    permissions: state.role.permissions,
  };
}

function RoleEditorBody({ state, onClose }: { state: OpenState; onClose: () => void }) {
  const catalogQuery = usePermissionCatalog({ enabled: true });
  const ownPermissions = useMe().data?.permissions;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const mutation = state.mode === 'create' ? createRole : updateRole;

  const initial = initialValues(state);
  const readOnly = state.mode === 'view';
  const [grid, setGrid] = useState<Permissions>(initial.permissions);
  const [gridErrors, setGridErrors] = useState<Record<string, string>>({});
  const form = useForm<RoleDetailsFormValues>({
    resolver: zodResolver(roleDetailsSchema),
    defaultValues: { name: initial.name, description: initial.description },
  });

  const role = state.mode === 'create' ? undefined : state.role;
  const title =
    state.mode === 'create'
      ? state.source
        ? `Duplicate ${state.source.name}`
        : 'New role'
      : state.mode === 'edit'
        ? `Edit ${state.role.name}`
        : state.role.name;

  const onSubmit = form.handleSubmit((values) => {
    const catalog = catalogQuery.data;
    if (!catalog) return;
    setGridErrors({});
    const body = {
      name: values.name,
      description: values.description,
      // Always the full grid: modules left out would become `none` anyway.
      permissions: normalisePermissions(catalog, grid),
    };
    const onError = (error: unknown) => {
      const cells: Record<string, string> = {};
      applyProblem(error, (field, fieldError) => {
        if (field.startsWith('permissions.')) cells[field] = fieldError.message;
        else if (field === 'name' || field === 'description') form.setError(field, fieldError);
      });
      setGridErrors(cells);
      if (hasProblemCode(error, 'name_taken')) {
        form.setError('name', { type: 'server', message: 'Another role already has this name.' });
      }
    };
    if (state.mode === 'create') {
      createRole.mutate(body, {
        onSuccess: (created) => {
          toast.success(`Role ${created.name} created.`);
          onClose();
        },
        onError,
      });
    } else if (role) {
      updateRole.mutate(
        { id: role.id, body },
        {
          onSuccess: (updated) => {
            toast.success(`Role ${updated.name} saved.`, {
              description:
                updated.userCount > 0
                  ? `Applies to ${plural(updated.userCount, 'user')} on their next request.`
                  : undefined,
            });
            onClose();
          },
          onError,
        },
      );
    }
  });

  const error = mutation.error;
  const exceeds = hasProblemCode(error, 'exceeds_own_access');
  const showAlert =
    mutation.isError &&
    !hasProblemCode(error, 'name_taken') &&
    !(hasProblemCode(error, 'validation_failed') && Object.keys(gridErrors).length === 0);

  return (
    <>
      <SheetHeader className="border-b p-6 pr-12">
        <div className="flex flex-wrap items-center gap-2">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {role?.locked && (
            <Badge variant="outline">
              <Lock aria-hidden />
              Locked
            </Badge>
          )}
        </div>
        <SheetDescription>
          {role?.locked
            ? 'The Owner role always has every permission and can’t be changed.'
            : readOnly
              ? 'You can see this role but not change it.'
              : role && role.userCount > 0
                ? `Changes apply to ${plural(role.userCount, 'user')} on their next request.`
                : 'Choose what people with this role can see and change.'}
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <form
          id={FORM_ID}
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="space-y-6 p-6"
        >
          {showAlert && (
            <InlineAlert>
              {exceeds
                ? 'You can’t grant more access than you have yourself. Lower the highlighted cells.'
                : hasProblemCode(error, 'validation_failed')
                  ? 'Some permissions aren’t allowed. Check the highlighted cells.'
                  : settingsErrorMessage(error, 'Couldn’t save the role.')}
            </InlineAlert>
          )}
          <FieldGroup className="gap-8">
            <FieldSet>
              <FieldLegend>Details</FieldLegend>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  autoComplete="off"
                  autoFocus={!readOnly}
                  disabled={readOnly}
                />
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Description"
                  rows={2}
                  placeholder="Optional. What is this role for?"
                  disabled={readOnly}
                />
              </div>
            </FieldSet>
            <FieldSet>
              <FieldLegend>Permissions</FieldLegend>
              {catalogQuery.isPending ? (
                <div className="space-y-2" aria-busy="true" aria-label="Loading permissions">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-11 w-full" />
                  ))}
                </div>
              ) : catalogQuery.isError ? (
                <QueryError
                  error={catalogQuery.error}
                  title="Couldn’t load the permission list"
                  onRetry={() => void catalogQuery.refetch()}
                  className="rounded-xl border"
                />
              ) : (
                <PermissionGrid
                  catalog={catalogQuery.data}
                  value={grid}
                  onChange={(next) => {
                    setGrid(next);
                    if (Object.keys(gridErrors).length) setGridErrors({});
                  }}
                  readOnly={readOnly}
                  errors={gridErrors}
                  ownPermissions={ownPermissions}
                />
              )}
            </FieldSet>
          </FieldGroup>
        </form>
      </ScrollArea>
      <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
        {readOnly ? (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              disabled={mutation.isPending || !catalogQuery.data}
            >
              {mutation.isPending
                ? 'Saving…'
                : state.mode === 'create'
                  ? 'Create role'
                  : 'Save changes'}
            </Button>
          </>
        )}
      </SheetFooter>
    </>
  );
}

interface RoleEditorSheetProps {
  state: RoleEditorState;
  onClose: () => void;
}

/** Wide side sheet to create, edit or (for locked roles) view a role and its permission grid. */
export function RoleEditorSheet({ state, onClose }: RoleEditorSheetProps) {
  // Keep the last open state so the content stays put while the sheet animates out.
  // Each opening gets a fresh body (new key), so unsaved edits never leak into the next one.
  const [shown, setShown] = useState<{ state: OpenState; key: number } | null>(null);
  if (state.mode !== 'closed' && state !== shown?.state) {
    setShown({ state, key: (shown?.key ?? 0) + 1 });
  }

  return (
    <Sheet
      open={state.mode !== 'closed'}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-4xl">
        {shown && <RoleEditorBody key={shown.key} state={shown.state} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}
