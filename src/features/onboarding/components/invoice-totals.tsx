import { formatPaise } from '@/lib/format';
import { cn } from '@/lib/utils';

interface InvoiceTotalsProps {
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  totalPaise: number;
  /** IGST instead of CGST + SGST. */
  interState: boolean;
  className?: string;
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', strong && 'text-base')}>
      <dt className={cn(strong ? 'font-semibold' : 'text-muted-foreground')}>{label}</dt>
      <dd className={cn('tabular-nums', strong ? 'font-semibold' : 'font-medium')}>
        {formatPaise(value)}
      </dd>
    </div>
  );
}

/** Taxable value, GST split, round-off and grand total. */
export function InvoiceTotals({
  taxablePaise,
  cgstPaise,
  sgstPaise,
  igstPaise,
  roundOffPaise,
  totalPaise,
  interState,
  className,
}: InvoiceTotalsProps) {
  return (
    <dl className={cn('space-y-2 text-sm', className)}>
      <Row label="Taxable value" value={taxablePaise} />
      {interState ? (
        <Row label="IGST" value={igstPaise} />
      ) : (
        <>
          <Row label="CGST" value={cgstPaise} />
          <Row label="SGST" value={sgstPaise} />
        </>
      )}
      {roundOffPaise !== 0 && <Row label="Round-off" value={roundOffPaise} />}
      <div className="border-t pt-2">
        <Row label="Total" value={totalPaise} strong />
      </div>
    </dl>
  );
}
