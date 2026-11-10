import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ComboboxItem {
  value: string;
  label: string;
  hint?: ReactNode;
  /** Extra text to match when searching. */
  keywords?: string;
}

interface RecordComboboxProps {
  items: readonly ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
}

/** Searchable single-record picker (contacts, deals) with a clear button. */
export function RecordCombobox({
  items,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  id,
  invalid,
  disabled,
}: RecordComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((item) => item.value === value);
  const clearable = Boolean(selected) && !disabled;

  return (
    <div className="relative flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            disabled={disabled}
            className={cn(
              'h-9 w-full justify-between font-normal',
              !selected && 'text-muted-foreground',
              clearable && 'pr-9',
            )}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            {!clearable && <ChevronsUpDown aria-hidden className="opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={`${item.label} ${item.keywords ?? ''} #${item.value}`}
                    onSelect={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      aria-hidden
                      className={cn(item.value === value ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{item.label}</span>
                      {item.hint && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {clearable && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Clear ${placeholder.toLowerCase()}`}
          className="absolute right-1.5"
          onClick={() => {
            onValueChange('');
          }}
        >
          <X aria-hidden />
        </Button>
      )}
    </div>
  );
}
