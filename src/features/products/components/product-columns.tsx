import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { DataTableColumnHeader, DataTableRowActions } from '@/components/data/data-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';

import type { Product } from '../types';

const dash = <span className="text-muted-foreground">—</span>;

interface ColumnOptions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function getProductColumns({ onEdit, onDelete }: ColumnOptions): ColumnDef<Product>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      meta: { label: 'Name', className: 'max-w-80' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="truncate text-xs text-muted-foreground">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      accessorKey: 'type',
      meta: { label: 'Type' },
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'service' ? 'human' : 'secondary'}>
          {row.original.type === 'service' ? 'Service' : 'Product'}
        </Badge>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      meta: { label: 'Category' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'sku',
      accessorKey: 'sku',
      meta: { label: 'SKU', className: 'font-mono text-xs' },
      header: 'SKU',
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'unit',
      accessorKey: 'unit',
      meta: { label: 'Unit' },
      header: 'Unit',
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'salePrice',
      accessorKey: 'salePrice',
      meta: { label: 'Sale price', className: 'text-right tabular-nums whitespace-nowrap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sale price" />,
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'sellingPrice',
      accessorKey: 'sellingPrice',
      meta: { label: 'Selling price', className: 'text-right tabular-nums whitespace-nowrap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Selling price" />,
      cell: ({ row }) => (
        <span
          className={
            row.original.sellingPrice < row.original.salePrice
              ? 'font-medium text-success'
              : undefined
          }
        >
          {formatCurrency(row.original.sellingPrice)}
        </span>
      ),
    },
    {
      id: 'taxPercent',
      accessorKey: 'taxPercent',
      meta: { label: 'GST', className: 'text-right tabular-nums' },
      header: 'GST',
      cell: ({ getValue }) => `${String(getValue<number>())}%`,
    },
    {
      id: 'stock',
      accessorKey: 'stock',
      meta: { label: 'Stock', className: 'text-right tabular-nums' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      cell: ({ getValue }) => getValue<number | null>() ?? dash,
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
