import { AlertTriangle } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { EmptyState } from './empty-state';

function describe(error: unknown): { title: string; detail: string } {
  if (isRouteErrorResponse(error)) {
    return error.status === 404
      ? {
          title: 'Page not found',
          detail: 'The page you are looking for does not exist or has moved.',
        }
      : { title: `Error ${String(error.status)}`, detail: error.statusText };
  }
  if (error instanceof Error) return { title: 'Something went wrong', detail: error.message };
  return { title: 'Something went wrong', detail: 'An unexpected error occurred.' };
}

export function RouteError() {
  const { title, detail } = describe(useRouteError());
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <EmptyState
        icon={AlertTriangle}
        title={title}
        description={detail}
        className="w-full max-w-lg border-solid bg-card"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload
            </Button>
            <Button asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
