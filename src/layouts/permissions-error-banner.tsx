import { AlertTriangle, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth';
import { isHttpError } from '@/services';

/**
 * Shown when GET /api/v1/me fails. Without it the app can't tell what the user may do, so
 * permission-gated screens (Settings, Automation, Nurture…) stay empty. A 404 means the backend
 * predates custom roles and needs rebuilding.
 */
export function PermissionsErrorBanner() {
  const { data, error, isError, isFetching, refetch } = useMe();
  if (data !== undefined || !isError) return null;

  const outdated = isHttpError(error) && error.status === 404;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive sm:px-6"
    >
      <AlertTriangle aria-hidden className="size-4 shrink-0" />
      <p className="min-w-0 flex-1">
        {outdated ? (
          <>
            Couldn’t load your permissions: the server doesn’t provide{' '}
            <code className="font-mono">/api/v1/me</code>. Restart the backend on the latest build (
            <code className="font-mono">make migrate</code> then{' '}
            <code className="font-mono">make run</code>).
          </>
        ) : (
          <>Couldn’t load your permissions, so some pages may be empty. {error.message}</>
        )}
      </p>
      <Button
        size="sm"
        variant="outline"
        disabled={isFetching}
        onClick={() => void refetch()}
        className="shrink-0"
      >
        <RotateCw aria-hidden className={isFetching ? 'animate-spin' : undefined} />
        Retry
      </Button>
    </div>
  );
}
