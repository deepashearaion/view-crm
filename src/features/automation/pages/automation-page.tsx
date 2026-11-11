import { Gauge, Globe, Lock, MessageCircle, Route, type LucideIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { useAccess } from '@/features/auth';

import { LeadSourcesTab } from '../components/lead-sources-tab';
import { RoutingTab } from '../components/routing-tab';
import { ScoringTab } from '../components/scoring-tab';
import { WhatsAppTab } from '../components/whatsapp-tab';

type Tab = 'scoring' | 'routing' | 'sources' | 'whatsapp';

const TABS: { value: Tab; label: string; icon: LucideIcon }[] = [
  { value: 'scoring', label: 'Scoring', icon: Gauge },
  { value: 'routing', label: 'Routing', icon: Route },
  { value: 'sources', label: 'Lead sources', icon: Globe },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export default function AutomationPage() {
  const access = useAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  const canViewSettings = access.can('settings', 'view');
  const canEditSettings = access.can('settings', 'edit');

  const requested = searchParams.get('tab');
  const tab = TABS.find((item) => item.value === requested)?.value ?? 'scoring';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Automation"
        badges={<WorkflowBadge kind="ai" />}
        description="Scoring rules, owner routing and lead sources."
      />

      {!access.ready ? null : !canViewSettings ? (
        <EmptyState
          icon={Lock}
          title="You don’t have access to automation settings"
          description="Ask someone who manages settings if lead scoring, routing or sources need to change."
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
          {!canEditSettings && (
            <InlineAlert tone="info">You can view these settings but not change them.</InlineAlert>
          )}
          <div className="overflow-x-auto">
            <TabsList>
              {TABS.map(({ value, label, icon: Icon }) => (
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
        </Tabs>
      )}
    </div>
  );
}
