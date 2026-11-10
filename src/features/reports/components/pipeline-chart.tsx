import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatPaise, plural } from '@/lib/format';

import { formatCompactPaise, formatNumber } from '../report-format';
import type { PipelineStageReport } from '../types';
import { TooltipRow } from './tooltip-row';

const chartConfig = {
  valuePaise: { label: 'Open value', color: 'var(--chart-1)' },
  weightedPaise: { label: 'Weighted', color: 'var(--chart-2)' },
} satisfies ChartConfig;

function isSeries(key: unknown): key is keyof typeof chartConfig {
  return key === 'valuePaise' || key === 'weightedPaise';
}

interface PipelineChartProps {
  stages: PipelineStageReport[];
  className?: string;
  /** Hide the legend in compact placements such as the home dashboard. */
  hideLegend?: boolean;
}

/** Open pipeline per stage: value and probability-weighted value. */
export function PipelineChart({
  stages,
  className = 'h-64 w-full',
  hideLegend,
}: PipelineChartProps) {
  return (
    <ChartContainer config={chartConfig} className={className}>
      <BarChart data={stages} margin={{ left: 4, right: 4 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tickMargin={8} />
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
              formatter={(value, name, item, index) => {
                const stage = item.payload as PipelineStageReport;
                return (
                  <div className="grid w-full gap-1">
                    <TooltipRow
                      color={item.color}
                      label={isSeries(name) ? chartConfig[name].label : String(name)}
                      value={formatPaise(Number(value))}
                    />
                    {index === 1 && (
                      <p className="mt-1 border-t pt-1.5 text-muted-foreground">
                        {plural(stage.deals, 'deal')} · {stage.probability}% probability
                        <br />
                        Avg {formatNumber(stage.avgDaysInStage)} days in stage
                      </p>
                    )}
                  </div>
                );
              }}
            />
          }
        />
        {!hideLegend && <ChartLegend content={<ChartLegendContent />} />}
        <Bar dataKey="valuePaise" fill="var(--color-valuePaise)" radius={4} />
        <Bar dataKey="weightedPaise" fill="var(--color-weightedPaise)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
