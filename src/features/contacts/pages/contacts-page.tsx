import { ChevronDown, Download, Plus, Trash2, Upload, UserRoundPlus, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { useSessionUser, useUserLookup, useUsers } from '@/features/auth';
import { downloadCsv, toCsv, type CsvColumn } from '@/lib/csv';
import { isWithinPreset, type DatePreset } from '@/lib/date-range';
import { formatDateTime } from '@/lib/format';
import { paths } from '@/routes/paths';

import { getContactColumns } from '../components/contact-columns';
import { ContactSheet, type ContactSheetState } from '../components/contact-sheet';
import { LEAD_SOURCES, LEAD_STATUSES, leadStatusById } from '../constants';
import { useBulkUpdateContacts, useContacts, useDeleteContacts } from '../hooks/use-contacts';
import type { Contact } from '../types';

const statusFacets: FacetOption[] = LEAD_STATUSES.map((status) => ({
  value: String(status.id),
  label: status.label,
}));
const sourceFacets: FacetOption[] = LEAD_SOURCES.map((source) => ({
  value: source,
  label: source,
}));

type Scope = 'all' | 'mine';

export default function ContactsPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionUser = useSessionUser();
  const { data: contacts = [], isPending, error, refetch } = useContacts();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const bulkUpdate = useBulkUpdateContacts();
  const deleteContacts = useDeleteContacts();

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [pendingDelete, setPendingDelete] = useState<Contact[] | null>(null);

  // Sheet state lives in the URL so a contact can be linked to directly.
  const selectedId = searchParams.get('contact');
  const sheetState: ContactSheetState = createOnMount
    ? { mode: 'create' }
    : selectedId
      ? { mode: searchParams.get('mode') === 'edit' ? 'edit' : 'view', id: selectedId }
      : { mode: 'closed' };

  const setSheetState = useCallback(
    (next: ContactSheetState) => {
      if (createOnMount && next.mode !== 'create') {
        void navigate(
          next.mode === 'closed' ? paths.contacts : `${paths.contacts}?contact=${next.id}`,
          { replace: true },
        );
        return;
      }
      setSearchParams(
        (params) => {
          params.delete('contact');
          params.delete('mode');
          if (next.mode === 'view' || next.mode === 'edit') params.set('contact', next.id);
          if (next.mode === 'edit') params.set('mode', 'edit');
          return params;
        },
        { replace: next.mode !== 'closed' && sheetState.mode !== 'closed' },
      );
    },
    [createOnMount, navigate, setSearchParams, sheetState.mode],
  );

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
        onView: (contact) => {
          setSheetState({ mode: 'view', id: contact.id });
        },
        onEdit: (contact) => {
          setSheetState({ mode: 'edit', id: contact.id });
        },
        onDelete: (contact) => {
          setPendingDelete([contact]);
        },
      }),
    [users, setSheetState],
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
      { header: 'Lead owner', value: (c) => (c.leadOwnerId ? users.get(c.leadOwnerId)?.name : '') },
      { header: 'Source', value: (c) => c.source },
      { header: 'Destination', value: (c) => c.destination },
      { header: 'Company ID', value: (c) => c.companyId },
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
            <Button variant="outline" asChild>
              <Link to={`${paths.import}?target=contacts`}>
                <Upload aria-hidden />
                Import
              </Link>
            </Button>
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
            <Button
              onClick={() => {
                void navigate(paths.contactsNew);
              }}
            >
              <Plus aria-hidden />
              New contact
            </Button>
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
        defaultHidden={['email', 'alternateMobile', 'companyId', 'notes', 'updatedAt']}
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
          </>
        )}
        emptyState={
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add your first contact or import a spreadsheet to get started."
            className="border-none"
            actions={
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
