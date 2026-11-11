import { AlertTriangle, Lock, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess } from '@/features/auth';

import { RolesTab } from '../components/roles-tab';
import { UsersTab } from '../components/users-tab';
import type { SettingsTab } from '../types';

const TABS: { value: SettingsTab; label: string; icon: LucideIcon }[] = [
  { value: 'users', label: 'Users', icon: Users },
  { value: 'roles', label: 'Roles & permissions', icon: ShieldCheck },
];

function SettingsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading settings">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export default function SettingsPage() {
  const access = useAccess();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tabs the user can't view are never rendered, so their queries never fire.
  const tabs = TABS.filter((tab) => access.can(tab.value, 'view'));
  const requested = searchParams.get('tab');
  const tab = tabs.find((item) => item.value === requested)?.value ?? tabs[0]?.value;

  const selectTab = (value: string) => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Settings"
        description="Who can sign in, and what each role can see and change."
      />

      {access.failed ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn’t load your permissions"
          description="Settings needs to know your role before it can show users and roles. See the message above, then retry."
        />
      ) : !access.ready ? (
        <SettingsSkeleton />
      ) : !tab ? (
        <EmptyState
          icon={Lock}
          title="You don’t have access to settings"
          description="Ask an owner or admin if you need to manage users or roles."
        />
      ) : (
        <Tabs value={tab} onValueChange={selectTab} className="gap-4">
          <div className="overflow-x-auto">
            <TabsList>
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="gap-2 px-3">
                  <Icon aria-hidden />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.some((item) => item.value === 'users') && (
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          )}
          {tabs.some((item) => item.value === 'roles') && (
            <TabsContent value="roles">
              <RolesTab
                onShowUsers={
                  access.can('users', 'view')
                    ? () => {
                        selectTab('users');
                      }
                    : undefined
                }
              />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
