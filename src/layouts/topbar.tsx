import { Fragment } from 'react';
import { Link, useMatches, useNavigation } from 'react-router-dom';
import { Search } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUiStore } from '@/lib/ui-store';
import type { RouteHandle } from '@/types';

import { AlertsMenu } from './alerts-menu';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

function isRouteHandle(handle: unknown): handle is RouteHandle {
  return typeof handle === 'object' && handle !== null && 'crumb' in handle;
}

function useBreadcrumbs(): { label: string; to: string }[] {
  const matches = useMatches();
  const crumbs: { label: string; to: string }[] = [];
  for (const match of matches) {
    if (
      isRouteHandle(match.handle) &&
      match.handle.crumb &&
      crumbs.at(-1)?.label !== match.handle.crumb
    ) {
      crumbs.push({ label: match.handle.crumb, to: match.pathname });
    }
  }
  return crumbs;
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);

export function Topbar() {
  const crumbs = useBreadcrumbs();
  const navigation = useNavigation();
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.to}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem
                className={index < crumbs.length - 1 ? 'hidden sm:inline-flex' : undefined}
              >
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="outline"
        className="hidden h-9 w-64 justify-start gap-2 text-muted-foreground md:flex"
        onClick={() => {
          setCommandOpen(true);
        }}
      >
        <Search aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <KbdGroup>
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Search"
        onClick={() => {
          setCommandOpen(true);
        }}
      >
        <Search aria-hidden />
      </Button>

      <AlertsMenu />
      <ThemeToggle />
      <UserMenu />

      {navigation.state === 'loading' && (
        <div
          role="progressbar"
          aria-label="Loading page"
          className="absolute inset-x-0 -bottom-px h-0.5 animate-pulse bg-primary"
        />
      )}
    </header>
  );
}
