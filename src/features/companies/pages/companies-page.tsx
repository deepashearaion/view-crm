import { Building2, Download, ListPlus, Plus, Trash2, Upload, UserRoundPlus } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionUser, useUserLookup, useUsers } from '@/features/auth';
import { useRecordSheetState } from '@/hooks/use-record-sheet-state';
import { downloadCsv, toCsv, type CsvColumn } from '@/lib/csv';
import { isWithinPreset, type DatePreset } from '@/lib/date-range';
import { formatDateTime } from '@/lib/format';
import { paths } from '@/routes/paths';

import { AddFieldDialog } from '../components/add-field-dialog';
import { getCompanyColumns } from '../components/company-columns';
import { CompanySheet } from '../components/company-sheet';
import { COMPANY_STATUSES, companyStatusByValue } from '../constants';
import { useCompanies, useCustomFields, useDeleteCompanies } from '../hooks/use-companies';
import type { Company } from '../types';

const statusFacets: FacetOption[] = COMPANY_STATUSES.map((status) => ({
  value: status.value,
  label: status.label,
}));

export default function CompaniesPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const { data: companies = [], isPending, error, refetch } = useCompanies();
  const { data: customFields = [] } = useCustomFields();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const deleteCompanies = useDeleteCompanies();

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [pendingDelete, setPendingDelete] = useState<Company[] | null>(null);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [sheetState, setSheetState] = useRecordSheetState({
    param: 'company',
    createOnMount,
    listPath: paths.companies,
  });

  const myId = sessionUser?.id === undefined ? null : String(sessionUser.id);
  const scoped = useMemo(
    () =>
      companies.filter(
        (company) =>
          (scope === 'all' || company.ownerId === myId) &&
          isWithinPreset(company.createdAt, datePreset),
      ),
    [companies, scope, myId, datePreset],
  );

  const columns = useMemo(
    () =>
      getCompanyColumns({
        users,
        customFields,
        onView: (company) => {
          setSheetState({ mode: 'view', id: company.id });
        },
        onEdit: (company) => {
          setSheetState({ mode: 'edit', id: company.id });
        },
        onDelete: (company) => {
          setPendingDelete([company]);
        },
      }),
    [users, customFields, setSheetState],
  );

  const exportCompanies = (rows: Company[], filename: string) => {
    const csvColumns: CsvColumn<Company>[] = [
      { header: 'Company', value: (c) => c.name },
      { header: 'Email', value: (c) => c.email },
      { header: 'Phone', value: (c) => c.mobile },
      { header: 'Status', value: (c) => companyStatusByValue(c.status)?.label },
      { header: 'Owner', value: (c) => (c.ownerId ? users.get(c.ownerId)?.name : '') },
      { header: 'Employees', value: (c) => c.employees },
      { header: 'Annual revenue', value: (c) => c.annualRevenue },
      { header: 'City', value: (c) => c.city },
      { header: 'State', value: (c) => c.state },
      { header: 'Country', value: (c) => c.country },
      { header: 'Lead source', value: (c) => c.leadSource },
      ...customFields.map<CsvColumn<Company>>((field) => ({
        header: field.label,
        value: (c) => {
          const value = c.customFields[field.id];
          return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
        },
      })),
      { header: 'Created', value: (c) => formatDateTime(c.createdAt) },
    ];
    downloadCsv(filename, toCsv(rows, csvColumns));
    toast.success(`Exported ${String(rows.length)} companies.`);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Companies"
        description="Organisations you sell to, with their owners and status."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setAddFieldOpen(true);
              }}
            >
              <ListPlus aria-hidden />
              Add field
            </Button>
            <Button variant="outline" asChild>
              <Link to={`${paths.import}?target=companies`}>
                <Upload aria-hidden />
                Import
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={scoped.length === 0}
              onClick={() => {
                exportCompanies(scoped, 'companies');
              }}
            >
              <Download aria-hidden />
              Export
            </Button>
            <Button
              onClick={() => {
                void navigate(paths.companiesNew);
              }}
            >
              <Plus aria-hidden />
              New company
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
            <Building2 aria-hidden />
            All companies
          </TabsTrigger>
          <TabsTrigger value="mine" disabled={!myId}>
            <UserRoundPlus aria-hidden />
            Assigned to me
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        label="Companies"
        storageKey="companies"
        columns={columns}
        data={scoped}
        getRowId={(company) => company.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        initialSorting={[{ id: 'createdAt', desc: true }]}
        defaultHidden={['country', 'leadSource', 'description', 'annualRevenue', 'updatedAt']}
        onRowClick={(company) => {
          setSheetState({ mode: 'view', id: company.id });
        }}
        toolbar={(table) => (
          <>
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search companies…" />
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
              options={userList.map((user) => ({ value: user.id, label: user.name }))}
            />
          </>
        )}
        bulkActions={(rows) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportCompanies(rows, 'companies-selection');
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
            icon={Building2}
            title="No companies yet"
            description="Add the organisations you work with, or import them from a spreadsheet."
            className="border-none"
            actions={
              <Button
                onClick={() => {
                  void navigate(paths.companiesNew);
                }}
              >
                <Plus aria-hidden />
                New company
              </Button>
            }
          />
        }
      />

      <CompanySheet state={sheetState} onStateChange={setSheetState} />
      <AddFieldDialog open={addFieldOpen} onOpenChange={setAddFieldOpen} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete?.length === 1
            ? `Delete ${pendingDelete[0]?.name ?? 'company'}?`
            : `Delete ${String(pendingDelete?.length ?? 0)} companies?`
        }
        description="Deleted companies are permanently removed. This can’t be undone."
        confirmLabel="Delete"
        destructive
        pending={deleteCompanies.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteCompanies.mutate(
            pendingDelete.map((company) => company.id),
            {
              onSuccess: ({ succeeded, failed }) => {
                if (failed.length)
                  toast.warning(
                    `Deleted ${String(succeeded.length)}; ${String(failed.length)} failed.`,
                  );
                else toast.success(`Deleted ${String(succeeded.length)} companies.`);
                setPendingDelete(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
