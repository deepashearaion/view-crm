import { FileText, SquareKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { paths } from '@/routes/paths';

export default function QuotationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Quotations"
        description="Price proposals sent to customers for open deals."
      />
      <EmptyState
        icon={FileText}
        title="No quotations yet"
        description="Quotations will be created from deals in the pipeline, using your products and services catalog."
        actions={
          <Button variant="outline" asChild>
            <Link to={paths.deals}>
              <SquareKanban aria-hidden />
              Open pipeline
            </Link>
          </Button>
        }
      />
    </div>
  );
}
