import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';

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
import type { Contact } from '@/features/contacts';
import { cn } from '@/lib/utils';

interface ContactComboboxProps {
  contacts: Contact[];
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
  /** Shows a clear button when a contact is picked. */
  clearable?: boolean;
  id?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
}

/** Searchable contact picker (name, email or mobile). */
export function ContactCombobox({
  contacts,
  value,
  onValueChange,
  placeholder = 'Pick a contact…',
  clearable = false,
  id,
  className,
  invalid,
  disabled,
}: ContactComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = contacts.find((contact) => contact.id === value);

  return (
    <div className={cn('relative flex items-center', className)}>
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
              clearable && selected && 'pr-9',
            )}
          >
            <span className="truncate">{selected?.fullName ?? placeholder}</span>
            {!(clearable && selected) && <ChevronsUpDown aria-hidden className="opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search contacts…" />
            <CommandList>
              <CommandEmpty>No contacts found.</CommandEmpty>
              <CommandGroup>
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={`${contact.fullName} ${contact.email} ${contact.mobile} #${contact.id}`}
                    onSelect={() => {
                      onValueChange(contact.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      aria-hidden
                      className={cn(contact.id === value ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{contact.fullName || 'Unnamed'}</span>
                      {(contact.email || contact.mobile) && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {contact.email || contact.mobile}
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
      {clearable && selected && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear contact"
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
