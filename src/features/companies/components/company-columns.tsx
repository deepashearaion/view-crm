import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import {
  DataTableColumnHeader,
  DataTableRowActions,
  facetFilterFn,
} from '@/components/data/data-table';
import { UserChip } from '@/components/data/user-chip';
import type { User } from '@/features/auth';
import { formatCurrency, formatDate } from '@/lib/format';

import type { Company, CustomFieldDefinition } from '../types';

import { CompanyStatusBadge } from './company-status-badge';

const dash = <span className="text-muted-foreground">—</span>;

interface ColumnOptions {
  users: Map<string, User>;
  customFields: CustomFieldDefinition[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function getCompanyColumns({
  users,
  customFields,
  onView,
  onEdit,
  onDelete,
}: ColumnOptions): ColumnDef<Company>[] {
  const custom: ColumnDef<Company>[] = customFields.map((field) => ({
    id: `custom:${field.id}`,
    accessorFn: (company) => company.customFields[field.id] ?? '',
    meta: { label: field.label },
    header: field.label,
    enableSorting: field.type !== 'checkbox',
    cell: ({ getValue }) => {
      const value = getValue<string | boolean>();
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      return value || dash;
    },
  }));

  return [
    {
      id: 'name',
      accessorKey: 'name',
      meta: { label: 'Company' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.email && (
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      id: 'mobile',
      accessorKey: 'mobile',
      meta: { label: 'Phone', className: 'whitespace-nowrap' },
      header: 'Phone',
      enableSorting: false,
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: { label: 'Status' },
      filterFn: facetFilterFn,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <CompanyStatusBadge status={row.original.status} />,
    },
    {
      id: 'owner',
      accessorFn: (company) => company.ownerId ?? '',
      meta: { label: 'Owner' },
      filterFn: facetFilterFn,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
      cell: ({ row }) => (
        <UserChip name={row.original.ownerId ? users.get(row.original.ownerId)?.name : undefined} />
      ),
    },
    {
      id: 'city',
      accessorKey: 'city',
      meta: { label: 'City' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'employees',
      accessorKey: 'employees',
      meta: { label: 'Employees', className: 'text-right tabular-nums' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Employees" />,
      cell: ({ getValue }) => getValue<number | null>()?.toLocaleString('en-IN') ?? dash,
    },
    {
      id: 'annualRevenue',
      accessorKey: 'annualRevenue',
      meta: { label: 'Annual revenue', className: 'text-right tabular-nums whitespace-nowrap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return value === null ? dash : formatCurrency(value);
      },
    },
    {
      id: 'country',
      accessorKey: 'country',
      meta: { label: 'Country' },
      header: 'Country',
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'leadSource',
      accessorKey: 'leadSource',
      meta: { label: 'Lead source' },
      header: 'Lead source',
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'description',
      accessorKey: 'description',
      meta: { label: 'Description', className: 'max-w-64' },
      header: 'Description',
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="truncate text-muted-foreground">{getValue<string>()}</p>
      ),
    },
    ...custom,
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
          label={`Actions for ${row.original.name}`}
          actions={[
            {
              label: 'View',
              icon: Eye,
              onSelect: () => {
                onView(row.original);
              },
            },
            {
              label: 'Edit',
              icon: Pencil,
              onSelect: () => {
                onEdit(row.original);
              },
            },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onSelect: () => {
                onDelete(row.original);
              },
            },
          ]}
        />
      ),
    },
  ];
}
