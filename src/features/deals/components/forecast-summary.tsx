import { format, parseISO } from 'date-fns';
import { Info, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPaise, plural } from '@/lib/format';
import { cn } from '@/lib/utils';

import type { DealForecast } from '../types';

interface ForecastSummaryProps {
  forecast: DealForecast | undefined;
  loading: boolean;
  error: boolean;
  className?: string;
}

const monthLabel = (month: string) => format(parseISO(`${month}-01`), 'MMM yyyy');

/** Compact table of GET /api/v1/deals/forecast: weighted, forecast and commit per month. */
export function ForecastSummary({ forecast, loading, error, className }: ForecastSummaryProps) {
  return (
    <Card className={cn('gap-0 py-3', className)}>
      <CardContent className="space-y-2 px-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Forecast
            {forecast?.method && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="How the forecast is calculated"
                    className="rounded-sm text-muted-foreground hover:text-foreground"
                  >
                    <Info aria-hidden className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{forecast.method}</TooltipContent>
              </Tooltip>
            )}
          </p>
          <TrendingUp aria-hidden className="size-4 text-muted-foreground" />
        </div>
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : error || !forecast ? (
          <p className="text-xs text-muted-foreground">Couldn’t load the forecast.</p>
        ) : (
          <>
            <table className="w-full text-xs tabular-nums">
              <thead className="text-muted-foreground">
                <tr>
                  <th scope="col" className="text-left font-medium">
                    Month
                  </th>
                  <th scope="col" className="text-right font-medium">
                    Weighted
                  </th>
                  <th scope="col" className="text-right font-medium">
                    Forecast
                  </th>
                  <th scope="col" className="text-right font-medium">
                    Commit
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecast.months.map((month) => (
                  <tr key={month.month}>
                    <th scope="row" className="text-left font-normal text-muted-foreground">
                      {monthLabel(month.month)}
                    </th>
                    <td className="text-right">{formatPaise(month.weightedPaise)}</td>
                    <td className="text-right font-medium">{formatPaise(month.forecastPaise)}</td>
                    <td className="text-right">{formatPaise(month.commitPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground">
              <span className={cn(forecast.overdue.deals > 0 && 'font-medium text-destructive')}>
                {plural(forecast.overdue.deals, 'overdue deal')} ·{' '}
                {formatPaise(forecast.overdue.valuePaise)}
              </span>
              {' · '}
              {plural(forecast.undated.deals, 'undated deal')} ·{' '}
              {formatPaise(forecast.undated.valuePaise)}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
