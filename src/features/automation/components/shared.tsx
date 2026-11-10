import { AlertTriangle, Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/services';

/** Placeholder rows while a settings table loads. */
export function TableSkeleton({ rows = 3, label }: { rows?: number; label: string }) {
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

/** Failed query with a retry button. */
export function QueryError({
  error,
  title,
  onRetry,
  className,
}: {
  error: unknown;
  title: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={errorMessage(error, 'Please try again.')}
      className={cn('border-none', className)}
      actions={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}

/** Icon (or labelled) button that copies `value` to the clipboard. */
export function CopyButton({
  value,
  label,
  showLabel = false,
  className,
}: {
  value: string;
  label: string;
  showLabel?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const Icon = copied ? Check : Copy;
  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? 'sm' : 'icon-sm'}
      aria-label={showLabel ? undefined : label}
      title={label}
      className={className}
      onClick={() => {
        navigator.clipboard.writeText(value).then(
          () => {
            setCopied(true);
            toast.success('Copied to clipboard.');
          },
          () => {
            toast.error('Couldn’t copy. Select the text and copy it manually.');
          },
        );
      }}
    >
      <Icon aria-hidden />
      {showLabel && (copied ? 'Copied' : label)}
    </Button>
  );
}
