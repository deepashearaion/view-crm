import type { ComponentProps } from 'react';

import { InlineAlert } from '@/components/feedback/inline-alert';
import { ChartCard } from '@/features/dashboard';
import { errorMessage } from '@/services';

interface ReportSectionProps extends ComponentProps<typeof ChartCard> {
  error?: unknown;
  /** Shown when the error carries no message. */
  errorText?: string;
}

/** ChartCard with an error state: loading skeleton, empty text, or an inline error. */
export function ReportSection({
  error,
  errorText = 'Couldn’t load this report.',
  empty,
  loading,
  children,
  ...props
}: ReportSectionProps) {
  const failed = Boolean(error) && !loading;
  return (
    <ChartCard {...props} loading={loading} empty={!failed && empty}>
      {failed ? <InlineAlert>{errorMessage(error, errorText)}</InlineAlert> : children}
    </ChartCard>
  );
}
