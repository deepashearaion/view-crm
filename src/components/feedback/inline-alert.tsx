import { AlertCircle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, { icon: LucideIcon; className: string }> = {
  error: {
    icon: AlertCircle,
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  success: { icon: CheckCircle2, className: 'border-success/30 bg-success/10 text-success' },
  info: { icon: Info, className: 'border-ai/30 bg-ai-muted text-ai-muted-foreground' },
};

interface InlineAlertProps extends ComponentProps<'div'> {
  tone?: Tone;
}

/** Compact message box for form-level errors and confirmations. */
export function InlineAlert({ tone = 'error', className, children, ...props }: InlineAlertProps) {
  const { icon: Icon, className: toneClass } = tones[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
        toneClass,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
