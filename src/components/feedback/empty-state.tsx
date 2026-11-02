import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

interface EmptyStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Primary/secondary actions, usually buttons. */
  actions?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center',
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon aria-hidden className="size-5" />
        </div>
      )}
      <div className="max-w-md space-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {children}
      {actions && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      )}
    </div>
  );
}
