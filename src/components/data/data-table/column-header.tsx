import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: ReactNode;
  className?: string;
}

/** Sortable header button; cycles ascending → descending → unsorted. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ChevronsUpDown;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-2 h-8 gap-1.5 px-2 font-medium data-[sorted=true]:text-foreground',
        className,
      )}
      data-sorted={sorted !== false}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      <Icon
        aria-hidden
        className={cn('size-3.5', sorted === false && 'text-muted-foreground/60')}
      />
    </Button>
  );
}
