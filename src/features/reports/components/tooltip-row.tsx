import type { ReactNode } from 'react';

interface TooltipRowProps {
  color: string | undefined;
  label: ReactNode;
  value: ReactNode;
}

/** One row of a ChartTooltipContent `formatter`: swatch, series label, formatted value. */
export function TooltipRow({ color, label, value }: TooltipRowProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto pl-3 font-mono font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
