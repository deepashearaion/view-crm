import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

interface UserChipProps {
  name: string | undefined;
  className?: string;
  /** Text shown when there is no user. */
  emptyLabel?: string;
}

/** Avatar + name for owners/assignees in tables and detail views. */
export function UserChip({ name, className, emptyLabel = 'Unassigned' }: UserChipProps) {
  if (!name) return <span className="text-muted-foreground">{emptyLabel}</span>;
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <Avatar className="size-6">
        <AvatarFallback className="bg-primary/10 text-[0.65rem] font-semibold text-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{name}</span>
    </span>
  );
}
