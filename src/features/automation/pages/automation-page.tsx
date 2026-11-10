import { Gauge, Globe, Lock, MessageCircle, Route, Users, type LucideIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { permissions, useSessionRole } from '@/features/auth';

import { LeadSourcesTab } from '../components/lead-sources-tab';
import { RoutingTab } from '../components/routing-tab';
import { ScoringTab } from '../components/scoring-tab';
import { TeamTab } from '../components/team-tab';
import { WhatsAppTab } from '../components/whatsapp-tab';

type Tab = 'scoring' | 'routing' | 'sources' | 'whatsapp' | 'team';

const TABS: { value: Tab; label: string; icon: LucideIcon }[] = [
  { value: 'scoring', label: 'Scoring', icon: Gauge },
  { value: 'routing', label: 'Routing', icon: Route },
  { value: 'sources', label: 'Lead sources', icon: Globe },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'team', label: 'Team', icon: Users },
];

export default function AutomationPage() {
  const role = useSessionRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManageSettings = permissions.canManageSettings(role);
  const canManageUsers = permissions.canManageUsers(role);

  const tabs = TABS.filter((tab) => tab.value !== 'team' || canManageUsers);
  const requested = searchParams.get('tab');
  const tab = tabs.find((item) => item.value === requested)?.value ?? 'scoring';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Automation"
        badges={<WorkflowBadge kind="ai" />}
        description="Scoring rules, owner routing, lead sources and your team."
      />

      {!canManageSettings ? (
        <EmptyState
          icon={Lock}
          title="Only managers and admins can change automation settings"
          description="Ask an owner, admin or manager if lead scoring, routing or sources need to change."
        />
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setSearchParams(
              (params) => {
                const next = new URLSearchParams(params);
                if (value === 'scoring') next.delete('tab');
                else next.set('tab', value);
                return next;
              },
              { replace: true },
            );
          }}
          className="gap-4"
        >
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
          <TabsContent value="scoring">
            <ScoringTab />
          </TabsContent>
          <TabsContent value="routing">
            <RoutingTab />
          </TabsContent>
          <TabsContent value="sources">
            <LeadSourcesTab />
          </TabsContent>
          <TabsContent value="whatsapp">
            <WhatsAppTab />
          </TabsContent>
          {canManageUsers && (
            <TabsContent value="team">
              <TeamTab />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
