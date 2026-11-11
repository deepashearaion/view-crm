import { Outlet } from 'react-router-dom';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from './app-sidebar';
import { CommandMenu } from './command-menu';
import { PermissionsErrorBanner } from './permissions-error-banner';
import { Topbar } from './topbar';

export function AppShell() {
  return (
    <SidebarProvider defaultOpen={window.matchMedia('(min-width: 1024px)').matches}>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Topbar />
        <PermissionsErrorBanner />
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  );
}
