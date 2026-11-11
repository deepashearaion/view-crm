import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import {
  DataTableColumnHeader,
  DataTableRowActions,
  facetFilterFn,
} from '@/components/data/data-table';
import { UserChip } from '@/components/data/user-chip';
import type { User } from '@/features/auth';
import type { Company } from '@/features/companies';
import { formatDate } from '@/lib/format';

import { leadStatusById, LIFECYCLE_STAGES } from '../constants';
import type { Contact } from '../types';

import { LifecycleStageBadge, OptedOutBadge, TemperatureBadge } from './contact-badges';
import { LeadStatusBadge } from './lead-status-badge';

const TEMPERATURE_ORDER = { hot: 3, warm: 2, cold: 1 } as const;
const stageOrder = (stage: string) => LIFECYCLE_STAGES.findIndex((entry) => entry.id === stage);

interface ColumnOptions {
  users: Map<string, User>;
  companies: Map<string, Company>;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  /** contacts.edit: shows Edit. */
  canEdit: boolean;
  /** contacts.delete: shows Delete. */
  canDelete: boolean;
}

export function getContactColumns({
  users,
  companies,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ColumnOptions): ColumnDef<Contact>[] {
  return [
    {
      id: 'name',
      accessorKey: 'fullName',
      meta: { label: 'Name' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium">
            <span className="truncate">{row.original.fullName}</span>
            <OptedOutBadge optedOutAt={row.original.optedOutAt} />
          </p>
          {row.original.email && (
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      id: 'email',
      accessorKey: 'email',
      meta: { label: 'Email' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      id: 'mobile',
      accessorKey: 'mobile',
      meta: { label: 'Mobile', className: 'whitespace-nowrap' },
      header: 'Mobile',
      enableSorting: false,
    },
    {
      id: 'alternateMobile',
      accessorKey: 'alternateMobile',
      meta: { label: 'Alternate mobile', className: 'whitespace-nowrap' },
      header: 'Alternate mobile',
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (contact) => (contact.leadStatusId === null ? '' : String(contact.leadStatusId)),
      meta: { label: 'Lead status' },
      filterFn: facetFilterFn,
      sortingFn: (a, b) =>
        (leadStatusById(a.original.leadStatusId)?.label ?? '').localeCompare(
          leadStatusById(b.original.leadStatusId)?.label ?? '',
        ),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Lead status" />,
      cell: ({ row }) => <LeadStatusBadge statusId={row.original.leadStatusId} />,
    },
    {
      id: 'lifecycle',
      accessorKey: 'lifecycleStage',
      meta: { label: 'Lifecycle stage' },
      filterFn: facetFilterFn,
      sortingFn: (a, b) =>
        stageOrder(a.original.lifecycleStage) - stageOrder(b.original.lifecycleStage),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
      cell: ({ row }) => <LifecycleStageBadge stage={row.original.lifecycleStage} />,
    },
    {
      id: 'temperature',
      accessorFn: (contact) => contact.temperature ?? '',
      meta: { label: 'Lead score' },
      filterFn: facetFilterFn,
      sortingFn: (a, b) =>
        (a.original.temperature ? TEMPERATURE_ORDER[a.original.temperature] : 0) -
          (b.original.temperature ? TEMPERATURE_ORDER[b.original.temperature] : 0) ||
        (a.original.score ?? -1) - (b.original.score ?? -1),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Score" />,
      cell: ({ row }) => <TemperatureBadge contact={row.original} />,
    },
    {
      id: 'owner',
      accessorFn: (contact) => contact.leadOwnerId ?? '',
      meta: { label: 'Lead owner' },
      filterFn: facetFilterFn,
      sortingFn: (a, b) =>
        (users.get(a.original.leadOwnerId ?? '')?.name ?? '').localeCompare(
          users.get(b.original.leadOwnerId ?? '')?.name ?? '',
        ),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
      cell: ({ row }) => (
        <UserChip
          name={row.original.leadOwnerId ? users.get(row.original.leadOwnerId)?.name : undefined}
        />
      ),
    },
    {
      id: 'source',
      accessorKey: 'source',
      meta: { label: 'Source' },
      filterFn: facetFilterFn,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ getValue }) =>
        getValue<string>() || <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'destination',
      accessorKey: 'destination',
      meta: { label: 'Destination' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
      cell: ({ getValue }) =>
        getValue<string>() || <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'company',
      accessorFn: (contact) =>
        contact.companyId === null
          ? ''
          : (companies.get(String(contact.companyId))?.name ?? `#${String(contact.companyId)}`),
      meta: { label: 'Company' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ getValue }) =>
        getValue<string>() || <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'notes',
      accessorKey: 'notes',
      meta: { label: 'Notes', className: 'max-w-64' },
      header: 'Notes',
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="truncate text-muted-foreground">{getValue<string>()}</p>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      meta: { label: 'Created', className: 'whitespace-nowrap' },
      sortingFn: 'datetime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      meta: { label: 'Modified', className: 'whitespace-nowrap' },
      sortingFn: 'datetime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Modified" />,
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-12 text-right' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DataTableRowActions
          label={`Actions for ${row.original.fullName}`}
          actions={[
            {
              label: 'View',
              icon: Eye,
              onSelect: () => {
                onView(row.original);
              },
            },
            ...(canEdit
              ? [
                  {
                    label: 'Edit',
                    icon: Pencil,
                    onSelect: () => {
                      onEdit(row.original);
                    },
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    label: 'Delete',
                    icon: Trash2,
                    destructive: true,
                    separatorBefore: true,
                    onSelect: () => {
                      onDelete(row.original);
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];
}
