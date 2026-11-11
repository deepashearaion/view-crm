import { ArrowDown, ArrowUp } from 'lucide-react';
import { useId } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import type { ReportColumn } from '../builder/datasets';

interface ColumnPickerProps {
  columns: ReportColumn[];
  /** Selected column ids, in output order. */
  value: string[];
  onValueChange: (ids: string[]) => void;
}

/**
 * Tick the columns to include. Ticked columns sit on top in output order and can be moved
 * up or down; unticked ones follow in their natural order.
 */
export function ColumnPicker({ columns, value, onValueChange }: ColumnPickerProps) {
  const baseId = useId();
  const byId = new Map(columns.map((column) => [column.id, column]));
  const selected = value.map((id) => byId.get(id)).filter((column) => column !== undefined);
  const unselected = columns.filter((column) => !value.includes(column.id));

  const toggle = (id: string, checked: boolean) => {
    onValueChange(checked ? [...value, id] : value.filter((item) => item !== id));
  };
  const move = (index: number, offset: -1 | 1) => {
    const next = [...value];
    const target = index + offset;
    const current = next[index];
    const other = next[target];
    if (current === undefined || other === undefined) return;
    next[index] = other;
    next[target] = current;
    onValueChange(next);
  };

  const row = (column: ReportColumn, checked: boolean, index?: number) => {
    const id = `${baseId}-${column.id}`;
    return (
      <li
        key={column.id}
        className={cn(
          'flex min-h-9 items-center gap-2 rounded-md px-2',
          checked ? 'bg-muted/60' : 'hover:bg-muted/40',
        )}
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(state) => {
            toggle(column.id, state === true);
          }}
        />
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer truncate py-1.5 text-sm">
          {column.label}
        </label>
        {index !== undefined && (
          <span className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Move ${column.label} up`}
              disabled={index === 0}
              onClick={() => {
                move(index, -1);
              }}
            >
              <ArrowUp aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Move ${column.label} down`}
              disabled={index === selected.length - 1}
              onClick={() => {
                move(index, 1);
              }}
            >
              <ArrowDown aria-hidden />
            </Button>
          </span>
        )}
      </li>
    );
  };

  return (
    <div role="group" aria-labelledby={`${baseId}-title`} className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={`${baseId}-title`} className="text-sm font-medium">
          Columns{' '}
          <span className="font-normal text-muted-foreground">
            ({selected.length} of {columns.length})
          </span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onValueChange([...value, ...unselected.map((column) => column.id)]);
            }}
            disabled={unselected.length === 0}
          >
            All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onValueChange(columns.filter((column) => column.preset).map((column) => column.id));
            }}
          >
            Default
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onValueChange([]);
            }}
            disabled={selected.length === 0}
          >
            None
          </Button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto rounded-lg border p-1">
        <ul className="space-y-0.5" aria-label="Included columns, in order">
          {selected.map((column, index) => row(column, true, index))}
        </ul>
        {selected.length > 0 && unselected.length > 0 && <div className="my-1 border-t" />}
        <ul className="space-y-0.5" aria-label="Other columns">
          {unselected.map((column) => row(column, false))}
        </ul>
      </div>
    </div>
  );
}
