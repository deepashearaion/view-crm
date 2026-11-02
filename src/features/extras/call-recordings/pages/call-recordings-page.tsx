import type { ColumnDef } from '@tanstack/react-table';
import { PhoneCall, PhoneIncoming, PhoneOutgoing, Timer } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  facetFilterFn,
} from '@/components/data/data-table';
import { DatePresetSelect } from '@/components/data/date-preset-select';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { StatCard } from '@/components/data/stat-card';
import { UserChip } from '@/components/data/user-chip';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { useUserLookup, useUsers, type User } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { isWithinPreset, type DatePreset } from '@/lib/date-range';
import { formatDateTime } from '@/lib/format';

import { formatDuration } from '../api/calls';
import { useCalls } from '../hooks/use-calls';
import { CALL_DIRECTIONS, CALL_OUTCOMES, type Call } from '../types';

function getColumns(
  users: Map<string, User>,
  contactName: (id: string | null) => string | undefined,
): ColumnDef<Call>[] {
  return [
    {
      id: 'contact',
      accessorFn: (call) => contactName(call.contactId) ?? call.phone,
      meta: { label: 'Contact' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => {
        const Icon = row.original.direction === 'inbound' ? PhoneIncoming : PhoneOutgoing;
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon aria-label={row.original.direction} className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">
                {contactName(row.original.contactId) ?? 'Unknown caller'}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">{row.original.phone}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'direction',
      accessorKey: 'direction',
      meta: { label: 'Direction' },
      filterFn: facetFilterFn,
      header: 'Direction',
      cell: ({ getValue }) =>
        CALL_DIRECTIONS.find((item) => item.value === getValue<string>())?.label,
    },
    {
      id: 'outcome',
      accessorKey: 'outcome',
      meta: { label: 'Outcome' },
      filterFn: facetFilterFn,
      header: 'Outcome',
      cell: ({ row }) => {
        const meta = CALL_OUTCOMES.find((item) => item.value === row.original.outcome);
        return meta ? <Badge variant={meta.variant}>{meta.label}</Badge> : null;
      },
    },
    {
      id: 'startedAt',
      accessorKey: 'startedAt',
      sortingFn: 'datetime',
      meta: { label: 'When', className: 'whitespace-nowrap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="When" />,
      cell: ({ getValue }) => formatDateTime(getValue<string>()),
    },
    {
      id: 'duration',
      accessorKey: 'durationSeconds',
      meta: { label: 'Duration', className: 'tabular-nums' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
      cell: ({ getValue }) => formatDuration(getValue<number>()),
    },
    {
      id: 'owner',
      accessorFn: (call) => call.ownerId ?? '',
      meta: { label: 'Rep' },
      filterFn: facetFilterFn,
      header: 'Rep',
      cell: ({ row }) => (
        <UserChip name={row.original.ownerId ? users.get(row.original.ownerId)?.name : undefined} />
      ),
    },
    {
      id: 'recording',
      enableSorting: false,
      meta: { label: 'Recording', className: 'w-72' },
      header: 'Recording',
      cell: ({ row }) =>
        row.original.recordingUrl ? (
          <audio
            controls
            preload="none"
            src={row.original.recordingUrl}
            className="h-8 w-64"
            aria-label="Call recording"
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            {row.original.outcome === 'connected' ? 'Not recorded' : '—'}
          </span>
        ),
    },
  ];
}

export default function CallRecordingsPage() {
  const { data: calls = [], isPending, error, refetch } = useCalls();
  const { data: contacts = [] } = useContacts();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const scoped = useMemo(
    () => calls.filter((call) => isWithinPreset(call.startedAt, datePreset)),
    [calls, datePreset],
  );
  const columns = useMemo(
    () => getColumns(users, (id) => (id ? contactNames.get(id) : undefined)),
    [users, contactNames],
  );

  const stats = useMemo(() => {
    const connected = scoped.filter((call) => call.outcome === 'connected');
    const talk = connected.reduce((sum, call) => sum + call.durationSeconds, 0);
    return {
      total: scoped.length,
      connected: connected.length,
      outbound: scoped.filter((call) => call.direction === 'outbound').length,
      average: connected.length ? Math.round(talk / connected.length) : 0,
    };
  }, [scoped]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Call recordings"
        description="Inbound and outbound calls with outcomes and recordings."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total calls" icon={PhoneCall} value={stats.total} loading={isPending} />
        <StatCard
          label="Connected"
          icon={PhoneIncoming}
          value={stats.connected}
          loading={isPending}
          hint={
            stats.total
              ? `${String(Math.round((stats.connected / stats.total) * 100))}% connect rate`
              : undefined
          }
        />
        <StatCard
          label="Outbound"
          icon={PhoneOutgoing}
          value={stats.outbound}
          loading={isPending}
        />
        <StatCard
          label="Avg. talk time"
          icon={Timer}
          value={formatDuration(stats.average)}
          loading={isPending}
        />
      </div>
      <DataTable
        label="Calls"
        storageKey="calls"
        columns={columns}
        data={scoped}
        getRowId={(call) => call.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        initialSorting={[{ id: 'startedAt', desc: true }]}
        defaultHidden={['direction']}
        toolbar={(table) => (
          <>
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search by name or number…"
            />
            <DatePresetSelect value={datePreset} onValueChange={setDatePreset} label="Call date" />
            <DataTableFacetedFilter
              column={table.getColumn('outcome')}
              title="Outcome"
              options={CALL_OUTCOMES.map((item) => ({ value: item.value, label: item.label }))}
            />
            <DataTableFacetedFilter
              column={table.getColumn('direction')}
              title="Direction"
              options={CALL_DIRECTIONS.map((item) => ({ value: item.value, label: item.label }))}
            />
            <DataTableFacetedFilter
              column={table.getColumn('owner')}
              title="Rep"
              options={userList.map((user) => ({ value: user.id, label: user.name }))}
            />
          </>
        )}
        emptyState={
          <EmptyState
            icon={PhoneCall}
            title="No calls in this period"
            description="Calls made through your telephony integration appear here automatically."
            className="border-none"
          />
        }
      />
    </div>
  );
}
