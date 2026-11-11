import { Building2, Moon, Sun, Upload, UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useTheme } from '@/hooks/use-theme';
import { useUiStore } from '@/lib/ui-store';

import { paths } from '@/routes/paths';

import { useVisibleNav } from './use-visible-nav';

const quickActions = [
  { label: 'New contact', to: paths.contactsNew, icon: UserPlus },
  { label: 'New company', to: paths.companiesNew, icon: Building2 },
  { label: 'Bulk import', to: paths.import, icon: Upload },
] as const;

/** Global Cmd/Ctrl+K palette for navigation and quick actions. */
export function CommandMenu() {
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { groups: navGroups, settings: settingsNav } = useVisibleNav();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!useUiStore.getState().commandOpen);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setOpen]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Jump to a page or run an action"
    >
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.to}
              onSelect={() => {
                run(() => void navigate(action.to));
              }}
            >
              <action.icon aria-hidden />
              {action.label}
            </CommandItem>
          ))}
          <CommandItem
            keywords={['theme', 'dark', 'light']}
            onSelect={() => {
              run(() => {
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              });
            }}
          >
            {resolvedTheme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
            Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} theme
          </CommandItem>
        </CommandGroup>
        {[...navGroups, { label: 'Settings', items: settingsNav }].map((group) => (
          <div key={group.label}>
            <CommandSeparator />
            <CommandGroup heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.to}
                  value={`${group.label} ${item.title}`}
                  keywords={item.keywords}
                  onSelect={() => {
                    run(() => void navigate(item.to));
                  }}
                >
                  <item.icon aria-hidden />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
