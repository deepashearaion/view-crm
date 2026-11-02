import { Package, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Button } from '@/components/ui/button';
import { paths } from '@/routes/paths';

export default function InvoicesPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Invoices"
        description="Invoices are raised automatically when a deal is won, as part of onboarding."
        badges={<WorkflowBadge kind="ai" label="Automatic" />}
      />
      <EmptyState
        icon={Receipt}
        title="No invoices yet"
        description="When a deal moves to Closed won, its onboarding sends a welcome message and drafts the invoice from your catalog."
        actions={
          <Button variant="outline" asChild>
            <Link to={paths.products}>
              <Package aria-hidden />
              Review catalog
            </Link>
          </Button>
        }
      />
    </div>
  );
}
