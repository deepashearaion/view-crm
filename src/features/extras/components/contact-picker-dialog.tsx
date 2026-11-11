import { Check, Unlink } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContacts } from '@/features/contacts';
import { cn } from '@/lib/utils';

interface ContactPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** The contact currently linked, if any; offers "Remove link" when set. */
  currentContactId: string | null;
  onSelect: (contactId: string | null) => void;
  pending?: boolean;
}

/** Search every visible contact by name, mobile or email and pick one. */
export function ContactPickerDialog({
  open,
  onOpenChange,
  title,
  description,
  currentContactId,
  onSelect,
  pending = false,
}: ContactPickerDialogProps) {
  const { data: contacts = [], isPending } = useContacts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 p-0 sm:max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Command className="border-t" aria-busy={pending}>
          <CommandInput placeholder="Search by name, mobile or email…" disabled={pending} />
          <CommandList className="max-h-80">
            <CommandEmpty>{isPending ? 'Loading contacts…' : 'No contact matches.'}</CommandEmpty>
            {currentContactId && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__remove-link"
                    disabled={pending}
                    onSelect={() => {
                      onSelect(null);
                    }}
                    className="text-destructive data-[selected=true]:text-destructive"
                  >
                    <Unlink aria-hidden />
                    Remove contact link
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="Contacts">
              {contacts.map((contact) => (
                <CommandItem
                  key={contact.id}
                  value={`${contact.fullName} ${contact.mobile} ${contact.alternateMobile} ${contact.email} #${contact.id}`}
                  disabled={pending}
                  onSelect={() => {
                    onSelect(contact.id);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{contact.fullName || 'Unnamed contact'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[contact.mobile, contact.email].filter(Boolean).join(' · ') ||
                        `#${contact.id}`}
                    </p>
                  </div>
                  <Check
                    aria-hidden
                    className={cn(
                      'shrink-0',
                      contact.id === currentContactId ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
