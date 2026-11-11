import { Link, useLocation } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { isItemActive, type NavItem } from '@/routes/nav';
import { paths } from '@/routes/paths';

import { RailItems, RailNav } from './sidebar-rail-nav';
import { useVisibleNav } from './use-visible-nav';

const legend = [
  { label: 'Automatic (AI)', className: 'bg-ai-muted border-ai/40' },
  { label: 'Human step', className: 'bg-human-muted border-human/40' },
  { label: 'Decision', className: 'bg-decision-muted border-decision/40' },
] as const;

const badgeTone = {
  ai: 'text-ai-muted-foreground bg-ai-muted',
  human: 'text-human-muted-foreground bg-human-muted',
  decision: 'text-decision-muted-foreground bg-decision-muted',
} as const;

const badgeLabel = { ai: 'AI', human: 'Rep', decision: 'Gate' } as const;

function NavLinkItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isItemActive(item, pathname);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link to={item.to} aria-current={isActive ? 'page' : undefined}>
          <item.icon aria-hidden />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {item.workflow && (
        <SidebarMenuBadge
          className={cn(
            'h-4.5 rounded-full px-1.5 text-[0.65rem] font-semibold',
            badgeTone[item.workflow],
          )}
        >
          {badgeLabel[item.workflow]}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { state, isMobile } = useSidebar();
  const rail = state === 'collapsed' && !isMobile;
  const { groups: navGroups, settings: settingsNav } = useVisibleNav();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton size="lg" asChild tooltip="Climetavere">
              <Link to={paths.home}>
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  C
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading font-semibold">CRM</span>
                  <span className="truncate text-xs text-muted-foreground">by Climetaverse</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:overflow-y-auto">
        {rail ? (
          <RailNav groups={navGroups} pathname={pathname} className="px-1.5 py-2" />
        ) : (
          navGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-1">
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavLinkItem key={item.to} item={item} pathname={pathname} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter>
        {rail ? (
          <RailItems items={settingsNav} pathname={pathname} />
        ) : (
          <SidebarMenu>
            {settingsNav.map((item) => (
              <NavLinkItem key={item.to} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        )}
        <ul
          aria-label="Workflow legend"
          className="space-y-1 px-2 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden"
        >
          {legend.map((entry) => (
            <li key={entry.label} className="flex items-center gap-2">
              <span aria-hidden className={cn('size-2.5 rounded-sm border', entry.className)} />
              {entry.label}
            </li>
          ))}
        </ul>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
