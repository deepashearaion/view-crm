import { Outlet } from 'react-router-dom';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from './app-sidebar';
import { CommandMenu } from './command-menu';
import { Topbar } from './topbar';

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Topbar />
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  );
}
