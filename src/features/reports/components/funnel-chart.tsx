import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { lifecycleStageById } from '@/features/contacts';

import { formatNumber, formatPercent } from '../report-format';
import type { FunnelReport } from '../types';
import { TooltipRow } from './tooltip-row';

const chartConfig = {
  reached: { label: 'Reached', color: 'var(--chart-1)' },
} satisfies ChartConfig;

interface FunnelRow {
  stage: string;
  reached: number;
  fromPreviousPercent: number;
  fromFirstStagePercent: number;
  tag: string;
}

/** Lifecycle funnel: how many contacts reached each stage in the period. */
export function FunnelChart({ report }: { report: FunnelReport }) {
  const data = useMemo<FunnelRow[]>(
    () =>
      report.stages.map((stage, index) => ({
        stage: lifecycleStageById(stage.stage)?.label ?? stage.stage,
        reached: stage.reached,
        fromPreviousPercent: stage.fromPreviousPercent,
        fromFirstStagePercent: stage.fromFirstStagePercent,
        tag:
          index === 0
            ? formatNumber(stage.reached)
            : `${formatNumber(stage.reached)} · ${formatPercent(stage.fromPreviousPercent)}`,
      })),
    [report.stages],
  );

  return (
    <div className="space-y-3">
      <ChartContainer config={chartConfig} className="h-56 w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 88 }} accessibilityLayer>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="stage" width={88} tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(_value, _name, item) => {
                  const row = item.payload as FunnelRow;
                  return (
                    <div className="grid w-full gap-1">
                      <TooltipRow
                        color={item.color}
                        label="Reached"
                        value={formatNumber(row.reached)}
                      />
                      <TooltipRow
                        color="transparent"
                        label="From previous"
                        value={formatPercent(row.fromPreviousPercent)}
                      />
                      <TooltipRow
                        color="transparent"
                        label="From first stage"
                        value={formatPercent(row.fromFirstStagePercent)}
                      />
                    </div>
                  );
                }}
              />
            }
          />
          <Bar dataKey="reached" fill="var(--color-reached)" radius={4}>
            <LabelList
              dataKey="tag"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {formatNumber(report.lost)}
        </span>{' '}
        lost in this period.
      </p>
    </div>
  );
}
