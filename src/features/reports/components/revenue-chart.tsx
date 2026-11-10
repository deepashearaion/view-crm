import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatPaise, plural } from '@/lib/format';

import { formatCompactPaise, formatReportMonth } from '../report-format';
import type { RevenueMonth } from '../types';
import { TooltipRow } from './tooltip-row';

const chartConfig = {
  wonPaise: { label: 'Won', color: 'var(--chart-1)' },
  invoicedPaise: { label: 'Invoiced', color: 'var(--chart-4)' },
  newArrPaise: { label: 'New ARR', color: 'var(--chart-2)' },
} satisfies ChartConfig;

function isSeries(key: unknown): key is keyof typeof chartConfig {
  return typeof key === 'string' && key in chartConfig;
}

/** Monthly won value and invoicing as bars, new ARR as a line. Oldest month first. */
export function RevenueChart({ months }: { months: RevenueMonth[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <ComposedChart data={months} margin={{ left: 4, right: 4 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={12}
          tickFormatter={(month: string) => formatReportMonth(month)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => formatCompactPaise(value)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(label: unknown) => formatReportMonth(String(label), true)}
              formatter={(value, name, item, index) => {
                const month = item.payload as RevenueMonth;
                return (
                  <div className="grid w-full gap-1">
                    <TooltipRow
                      color={item.color}
                      label={isSeries(name) ? chartConfig[name].label : String(name)}
                      value={formatPaise(Number(value))}
                    />
                    {index === 2 && (
                      <p className="mt-1 border-t pt-1.5 text-muted-foreground">
                        {plural(month.wonDeals, 'won deal')} ·{' '}
                        {plural(month.newCustomers, 'new customer')}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="wonPaise" fill="var(--color-wonPaise)" radius={4} />
        <Bar dataKey="invoicedPaise" fill="var(--color-invoicedPaise)" radius={4} />
        <Line
          dataKey="newArrPaise"
          type="monotone"
          stroke="var(--color-newArrPaise)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
