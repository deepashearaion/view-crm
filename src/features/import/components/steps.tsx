import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

import { IMPORT_STEPS } from '../constants';

/** Horizontal progress indicator for the import wizard. */
export function ImportSteps({ current }: { current: number }) {
  return (
    <ol aria-label="Import progress" className="flex flex-wrap items-center gap-2 text-sm">
      {IMPORT_STEPS.map((label, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li
            key={label}
            aria-current={state === 'current' ? 'step' : undefined}
            className="flex items-center gap-2"
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full border text-xs font-semibold',
                state === 'done' && 'border-primary bg-primary text-primary-foreground',
                state === 'current' && 'border-primary text-primary',
                state === 'todo' && 'text-muted-foreground',
              )}
            >
              {state === 'done' ? <Check aria-hidden className="size-3.5" /> : index + 1}
            </span>
            <span className={cn(state === 'todo' ? 'text-muted-foreground' : 'font-medium')}>
              {label}
            </span>
            {index < IMPORT_STEPS.length - 1 && (
              <span aria-hidden className="mx-1 h-px w-8 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
