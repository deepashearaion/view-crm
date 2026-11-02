import { Package, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '@/components/data/data-table';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecordSheetState } from '@/hooks/use-record-sheet-state';
import { paths } from '@/routes/paths';

import { getProductColumns } from '../components/product-columns';
import { ProductSheet } from '../components/product-sheet';
import { useDeleteProducts, useProducts } from '../hooks/use-products';
import type { Product, ProductType } from '../types';

type Tab = 'all' | ProductType;

export default function ProductsPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const { data: products = [], isPending, error, refetch } = useProducts();
  const deleteProducts = useDeleteProducts();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Product[] | null>(null);
  const [sheetState, setSheetState] = useRecordSheetState({
    param: 'product',
    createOnMount,
    listPath: paths.products,
  });

  const counts = useMemo(
    () => ({
      all: products.length,
      product: products.filter((item) => item.type === 'product').length,
      service: products.filter((item) => item.type === 'service').length,
    }),
    [products],
  );
  const visible = useMemo(
    () => (tab === 'all' ? products : products.filter((item) => item.type === tab)),
    [products, tab],
  );

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: (product) => {
          setSheetState({ mode: 'edit', id: product.id });
        },
        onDelete: (product) => {
          setPendingDelete([product]);
        },
      }),
    [setSheetState],
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Products & services"
        description="Your catalog of packages and services, used on quotations and invoices."
        actions={
          <Button
            onClick={() => {
              void navigate(`${paths.products}/new`);
            }}
          >
            <Plus aria-hidden />
            New item
          </Button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tab);
        }}
      >
        <TabsList>
          {(
            [
              ['all', 'All'],
              ['product', 'Products'],
              ['service', 'Services'],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              {label}
              <Badge variant="secondary" className="h-4.5 min-w-5 px-1.5 tabular-nums">
                {counts[value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        label="Products and services"
        storageKey="products"
        columns={columns}
        data={visible}
        getRowId={(product) => product.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        defaultHidden={['category', 'sku', 'unit', 'stock']}
        onRowClick={(product) => {
          setSheetState({ mode: 'edit', id: product.id });
        }}
        toolbar={() => (
          <SearchInput value={search} onValueChange={setSearch} placeholder="Search catalog…" />
        )}
        bulkActions={(rows) => (
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
        emptyState={
          <EmptyState
            icon={Package}
            title={tab === 'service' ? 'No services yet' : 'Your catalog is empty'}
            description="Add the packages and services you sell so they can be quoted and invoiced."
            className="border-none"
          />
        }
      />

      <ProductSheet state={sheetState} onStateChange={setSheetState} />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete?.length === 1
            ? `Delete ${pendingDelete[0]?.name ?? 'item'}?`
            : `Delete ${String(pendingDelete?.length ?? 0)} items?`
        }
        description="Removed items can no longer be added to quotations or invoices."
        confirmLabel="Delete"
        destructive
        pending={deleteProducts.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteProducts.mutate(
            pendingDelete.map((item) => item.id),
            {
              onSuccess: ({ succeeded, failed }) => {
                if (failed.length)
                  toast.warning(
                    `Deleted ${String(succeeded.length)}; ${String(failed.length)} failed.`,
                  );
                else
                  toast.success(
                    succeeded.length === 1
                      ? 'Item deleted.'
                      : `Deleted ${String(succeeded.length)} items.`,
                  );
                setPendingDelete(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
