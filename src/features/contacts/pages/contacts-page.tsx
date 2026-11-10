import { ChevronDown, Download, Plus, Trash2, Upload, UserRoundPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable, DataTableFacetedFilter, type FacetOption } from '@/components/data/data-table';
import { DatePresetSelect } from '@/components/data/date-preset-select';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  permissions,
  useSessionRole,
  useSessionUser,
  useUserLookup,
  useUsers,
} from '@/features/auth';
import { useCompanyLookup } from '@/features/companies';
import { useRecordSheetState } from '@/hooks/use-record-sheet-state';
import { downloadCsv, toCsv, type CsvColumn } from '@/lib/csv';
import { isWithinPreset, type DatePreset } from '@/lib/date-range';
import { formatDateTime } from '@/lib/format';
import { paths } from '@/routes/paths';

import { getContactColumns } from '../components/contact-columns';
import { ContactSheet } from '../components/contact-sheet';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  leadStatusById,
  LIFECYCLE_STAGES,
  lifecycleStageById,
  TEMPERATURES,
} from '../constants';
import { useBulkUpdateContacts, useContacts, useDeleteContacts } from '../hooks/use-contacts';
import type { Contact } from '../types';

const statusFacets: FacetOption[] = LEAD_STATUSES.map((status) => ({
  value: String(status.id),
  label: status.label,
}));
const lifecycleFacets: FacetOption[] = LIFECYCLE_STAGES.map((stage) => ({
  value: stage.id,
  label: stage.label,
}));
const temperatureFacets: FacetOption[] = TEMPERATURES.map((temperature) => ({
  value: temperature.id,
  label: temperature.label,
}));
const sourceFacets: FacetOption[] = LEAD_SOURCES.map((source) => ({
  value: source,
  label: source,
}));

type Scope = 'all' | 'mine';

export default function ContactsPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const role = useSessionRole();
  const canEdit = permissions.canEdit(role);
  const canReassign = permissions.canReassign(role);
  const { data: contacts = [], isPending, error, refetch } = useContacts();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const companies = useCompanyLookup();
  const bulkUpdate = useBulkUpdateContacts();
  const deleteContacts = useDeleteContacts();

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [pendingDelete, setPendingDelete] = useState<Contact[] | null>(null);

  const [sheetState, setSheetState] = useRecordSheetState({
    param: 'contact',
    // Viewers can't create: /contacts/new just shows the list.
    createOnMount: createOnMount && canEdit,
    listPath: paths.contacts,
  });

  const myId = sessionUser?.id === undefined ? null : String(sessionUser.id);
  const scoped = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          (scope === 'all' || contact.leadOwnerId === myId) &&
          isWithinPreset(contact.createdAt, datePreset),
      ),
    [contacts, scope, myId, datePreset],
  );

  const columns = useMemo(
    () =>
      getContactColumns({
        users,
        companies,
        onView: (contact) => {
          setSheetState({ mode: 'view', id: contact.id });
        },
        onEdit: (contact) => {
          setSheetState({ mode: 'edit', id: contact.id });
        },
        onDelete: (contact) => {
          setPendingDelete([contact]);
        },
        canEdit,
      }),
    [users, companies, setSheetState, canEdit],
  );

  const ownerFacets: FacetOption[] = userList.map((user) => ({ value: user.id, label: user.name }));

  const exportContacts = (rows: Contact[], filename: string) => {
    const csvColumns: CsvColumn<Contact>[] = [
      { header: 'First name', value: (c) => c.firstName },
      { header: 'Last name', value: (c) => c.lastName },
      { header: 'Email', value: (c) => c.email },
      { header: 'Mobile', value: (c) => c.mobile },
      { header: 'Alternate mobile', value: (c) => c.alternateMobile },
      { header: 'Lead status', value: (c) => leadStatusById(c.leadStatusId)?.label },
      { header: 'Lifecycle stage', value: (c) => lifecycleStageById(c.lifecycleStage)?.label },
      { header: 'Temperature', value: (c) => c.temperature ?? '' },
      { header: 'Score', value: (c) => (c.score === null ? '' : String(c.score)) },
      { header: 'Opted out', value: (c) => (c.optedOutAt ? formatDateTime(c.optedOutAt) : '') },
      { header: 'Lead owner', value: (c) => (c.leadOwnerId ? users.get(c.leadOwnerId)?.name : '') },
      { header: 'Source', value: (c) => c.source },
      { header: 'Destination', value: (c) => c.destination },
      {
        header: 'Company',
        value: (c) => (c.companyId === null ? '' : companies.get(String(c.companyId))?.name),
      },
      { header: 'Notes', value: (c) => c.notes },
      { header: 'Created', value: (c) => formatDateTime(c.createdAt) },
    ];
    downloadCsv(filename, toCsv(rows, csvColumns));
    toast.success(`Exported ${String(rows.length)} contacts.`);
  };

  const reportBatch = (
    verb: string,
    { succeeded, failed }: { succeeded: string[]; failed: string[] },
  ) => {
    if (failed.length === 0) toast.success(`${verb} ${String(succeeded.length)} contacts.`);
    else
      toast.warning(
        `${verb} ${String(succeeded.length)} contacts; ${String(failed.length)} failed. Please retry.`,
      );
  };

  const updateMany = (
    rows: Contact[],
    body: Parameters<typeof bulkUpdate.mutate>[0]['body'],
    verb: string,
    done: () => void,
  ) => {
    bulkUpdate.mutate(
      { ids: rows.map((row) => row.id), body },
      {
        onSuccess: (result) => {
          reportBatch(verb, result);
          done();
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Contacts"
        description="Everyone you’re talking to: leads, customers and partners."
        actions={
          <>
            {canEdit && (
              <Button variant="outline" asChild>
                <Link to={`${paths.import}?target=contacts`}>
                  <Upload aria-hidden />
                  Import
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              disabled={scoped.length === 0}
              onClick={() => {
                exportContacts(scoped, 'contacts');
              }}
            >
              <Download aria-hidden />
              Export
            </Button>
            {canEdit && (
              <Button
                onClick={() => {
                  void navigate(paths.contactsNew);
                }}
              >
                <Plus aria-hidden />
                New contact
              </Button>
            )}
          </>
        }
      />

      <Tabs
        value={scope}
        onValueChange={(value) => {
          setScope(value === 'mine' ? 'mine' : 'all');
        }}
      >
        <TabsList>
          <TabsTrigger value="all">
            <Users aria-hidden />
            All contacts
          </TabsTrigger>
          <TabsTrigger value="mine" disabled={!myId}>
            <UserRoundPlus aria-hidden />
            Assigned to me
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        label="Contacts"
        storageKey="contacts"
        columns={columns}
        data={scoped}
        getRowId={(contact) => contact.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        initialSorting={[{ id: 'createdAt', desc: true }]}
        defaultHidden={['email', 'alternateMobile', 'company', 'notes', 'updatedAt']}
        onRowClick={(contact) => {
          setSheetState({ mode: 'view', id: contact.id });
        }}
        toolbar={(table) => (
          <>
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search contacts…" />
            <DatePresetSelect
              value={datePreset}
              onValueChange={setDatePreset}
              label="Created date"
            />
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Status"
              options={statusFacets}
            />
            <DataTableFacetedFilter
              column={table.getColumn('lifecycle')}
              title="Stage"
              options={lifecycleFacets}
            />
            <DataTableFacetedFilter
              column={table.getColumn('temperature')}
              title="Temperature"
              options={temperatureFacets}
            />
            <DataTableFacetedFilter
              column={table.getColumn('owner')}
              title="Owner"
              options={ownerFacets}
            />
            <DataTableFacetedFilter
              column={table.getColumn('source')}
              title="Source"
              options={sourceFacets}
            />
          </>
        )}
        bulkActions={(rows, clear) => (
          <>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                    Set status
                    <ChevronDown aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {LEAD_STATUSES.map((status) => (
                    <DropdownMenuItem
                      key={status.id}
                      onSelect={() => {
                        updateMany(rows, { lead_status_id: status.id }, 'Updated', clear);
                      }}
                    >
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {canReassign && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                    Assign owner
                    <ChevronDown aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {userList.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onSelect={() => {
                        updateMany(rows, { lead_owner_id: Number(user.id) }, 'Reassigned', clear);
                      }}
                    >
                      {user.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportContacts(rows, 'contacts-selection');
              }}
            >
              <Download aria-hidden />
              Export
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setPendingDelete(rows);
                }}
              >
                <Trash2 aria-hidden />
                Delete
              </Button>
            )}
          </>
        )}
        emptyState={
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description={
              canEdit
                ? 'Add your first contact or import a spreadsheet to get started.'
                : 'Contacts your team adds will show up here.'
            }
            className="border-none"
            actions={
              canEdit && (
                <>
                  <Button variant="outline" asChild>
                    <Link to={`${paths.import}?target=contacts`}>
                      <Upload aria-hidden />
                      Import
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      void navigate(paths.contactsNew);
                    }}
                  >
                    <Plus aria-hidden />
                    New contact
                  </Button>
                </>
              )
            }
          />
        }
      />

      <ContactSheet state={sheetState} onStateChange={setSheetState} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete?.length === 1
            ? `Delete ${pendingDelete[0]?.fullName ?? 'contact'}?`
            : `Delete ${String(pendingDelete?.length ?? 0)} contacts?`
        }
        description="Deleted contacts are permanently removed. This can’t be undone."
        confirmLabel="Delete"
        destructive
        pending={deleteContacts.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteContacts.mutate(
            pendingDelete.map((contact) => contact.id),
            {
              onSuccess: (result) => {
                reportBatch('Deleted', result);
                setPendingDelete(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
