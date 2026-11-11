import { useEffect, useRef, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { isItemActive, type NavGroup, type NavItem } from '@/routes/nav';

/** Collapsed-sidebar navigation: icon tile + name per group, sub-items in a flyout. */

const CLOSE_DELAY_MS = 120;

const entryClass =
  'group/rail flex w-full flex-col items-center gap-0.5 rounded-md px-1 py-1 text-center outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring';

function RailTile({
  icon: Icon,
  label,
  active,
}: {
  icon: NavItem['icon'];
  label: string;
  active: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-lg transition-colors [&_svg]:size-[1.125rem]',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-sidebar-accent text-sidebar-foreground group-hover/rail:bg-sidebar-accent/70',
        )}
      >
        <Icon aria-hidden />
      </span>
      <span
        className={cn(
          'w-full truncate text-[0.68rem] leading-tight',
          active ? 'font-medium text-primary' : 'text-sidebar-foreground/80',
        )}
      >
        {label}
      </span>
    </>
  );
}

/**
 * A direct link. `label` overrides the item title so a one-item group shows its group heading
 * (e.g. "Overview" for Home), matching the expanded menu.
 */
function RailLink({
  item,
  pathname,
  label = item.title,
}: {
  item: NavItem;
  pathname: string;
  label?: string;
}) {
  const active = isItemActive(item, pathname);
  return (
    <li>
      <Link
        to={item.to}
        aria-current={active ? 'page' : undefined}
        aria-label={label === item.title ? undefined : `${label}: ${item.title}`}
        title={label === item.title ? undefined : item.title}
        className={entryClass}
      >
        <RailTile icon={item.icon} label={label} active={active} />
      </Link>
    </li>
  );
}

function RailFlyout({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const active = group.items.some((item) => isItemActive(item, pathname));

  const cancelClose = () => {
    window.clearTimeout(closeTimer.current);
  };
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  return (
    <li>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={entryClass}
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          aria-label={`${group.label} menu`}
        >
          <RailTile
            icon={group.icon ?? group.items[0]?.icon ?? LayoutGrid}
            label={group.label}
            active={active}
          />
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={6}
          className="w-52 gap-0 p-1.5"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <p className="px-2.5 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const itemActive = isItemActive(item, pathname);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={itemActive ? 'page' : undefined}
                    onClick={() => {
                      setOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-hidden hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                      itemActive ? 'font-medium text-primary' : 'text-popover-foreground',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        itemActive ? 'bg-primary' : 'bg-muted-foreground/60',
                      )}
                    />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </li>
  );
}

export function RailNav({
  groups,
  pathname,
  className,
}: {
  groups: NavGroup[];
  pathname: string;
  className?: string;
}) {
  return (
    <nav aria-label="Main">
      <ul className={cn('flex flex-col gap-1', className)}>
        {groups.map((group) => {
          const [only, ...rest] = group.items;
          return only && rest.length === 0 ? (
            <RailLink key={group.label} item={only} pathname={pathname} label={group.label} />
          ) : (
            <RailFlyout key={group.label} group={group} pathname={pathname} />
          );
        })}
      </ul>
    </nav>
  );
}

export function RailItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <RailLink key={item.to} item={item} pathname={pathname} />
      ))}
    </ul>
  );
}
