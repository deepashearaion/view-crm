import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Play } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccess, useMe, useUserLookup } from '@/features/auth';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { errorMessage } from '@/services';

import {
  ALL_VALUES,
  ANY_DATE,
  presetColumnIds,
  REPORT_DATASETS,
  REPORT_GROUP_LABELS,
  type ReportRequest,
} from '../builder/datasets';
import { downloadReport, generateReport, type GeneratedReport } from '../builder/run-report';
import type { ReportRange } from '../types';

import { ColumnPicker } from './column-picker';
import { ReportPreview } from './report-preview';
import { ReportRangePicker } from './report-range-picker';

const isString = (value: unknown): value is string => typeof value === 'string';
const isColumnChoices = (value: unknown): value is Record<string, string[]> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((ids) => Array.isArray(ids) && ids.every(isString));

const sameRequest = (a: ReportRequest, b: ReportRequest) =>
  a.range.from === b.range.from &&
  a.range.to === b.range.to &&
  a.dateBasis === b.dateBasis &&
  a.filter === b.filter &&
  a.columnIds.length === b.columnIds.length &&
  a.columnIds.every((id, index) => id === b.columnIds[index]);

interface ReportBuilderProps {
  range: ReportRange;
  onRangeChange: (range: ReportRange) => void;
}

/** Pick a report, period, filter and columns; preview it, then download it as Excel. */
export function ReportBuilder({ range, onRangeChange }: ReportBuilderProps) {
  const queryClient = useQueryClient();
  const access = useAccess();
  const users = useUserLookup();
  const { data: me } = useMe();

  const datasets = REPORT_DATASETS.filter((dataset) => dataset.allowed(access));
  const [storedDatasetId, setDatasetId] = usePersistedState(
    'climetavere.reports.builder.dataset',
    'sources',
    isString,
  );
  // Column choices are remembered per report on this device.
  const [columnChoices, setColumnChoices] = usePersistedState<Record<string, string[]>>(
    'climetavere.reports.builder.columns',
    {},
    isColumnChoices,
  );
  const [dateBases, setDateBases] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [report, setReport] = useState<GeneratedReport>();

  const dataset = datasets.find((item) => item.id === storedDatasetId) ?? datasets[0];

  const generate = useMutation({
    mutationFn: (args: { request: ReportRequest }) => {
      if (!dataset) throw new Error('No report selected.');
      return generateReport(queryClient, dataset, args.request, users, access);
    },
    onSuccess: setReport,
  });

  if (!dataset) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        Your role doesn’t include any reports you can build.
      </p>
    );
  }

  const validIds = new Set(dataset.columns.map((column) => column.id));
  const columnIds = (columnChoices[dataset.id] ?? presetColumnIds(dataset)).filter((id) =>
    validIds.has(id),
  );
  const dateBasis = dateBases[dataset.id] ?? dataset.dateBases[0]?.id ?? ANY_DATE;
  const filter = filters[dataset.id] ?? ALL_VALUES;
  const request: ReportRequest = { range, dateBasis, filter, columnIds };

  const stale =
    report !== undefined &&
    (report.dataset.id !== dataset.id || !sameRequest(report.request, request));
  const showsRange =
    dataset.period === 'api' || (dataset.period === 'rows' && dateBasis !== ANY_DATE);

  const onGenerate = () => {
    generate.mutate({ request });
  };

  const onDownload = async () => {
    try {
      const current = report && !stale ? report : await generate.mutateAsync({ request });
      downloadReport(current, me?.user.name ?? '');
      toast.success(`${current.dataset.label} downloaded`, {
        description: `${current.rows.length} rows saved as an Excel file.`,
      });
    } catch (error) {
      toast.error(errorMessage(error, 'Couldn’t download this report.'));
    }
  };

  const groups = (['summary', 'records'] as const)
    .map((group) => ({ group, items: datasets.filter((item) => item.group === group) }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Generate a report</CardTitle>
          <CardDescription>
            Choose what to include. Your column picks are remembered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="report-dataset">Report</Label>
            <Select value={dataset.id} onValueChange={setDatasetId}>
              <SelectTrigger id="report-dataset" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map(({ group, items }) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{REPORT_GROUP_LABELS[group]}</SelectLabel>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{dataset.description}</p>
          </div>

          {dataset.period === 'rows' && (
            <div className="space-y-2">
              <Label htmlFor="report-date-basis">Date to filter by</Label>
              <Select
                value={dateBasis}
                onValueChange={(value) => {
                  setDateBases((current) => ({ ...current, [dataset.id]: value }));
                }}
              >
                <SelectTrigger id="report-date-basis" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataset.dateBases.map((basis) => (
                    <SelectItem key={basis.id} value={basis.id}>
                      {basis.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={ANY_DATE}>Any date (all records)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Period</p>
            {showsRange ? (
              <ReportRangePicker value={range} onValueChange={onRangeChange} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {dataset.period === 'none'
                  ? 'Snapshot of right now; the period doesn’t apply.'
                  : 'Every record, whatever its date.'}
              </p>
            )}
          </div>

          {dataset.filter && (
            <div className="space-y-2">
              <Label htmlFor="report-filter">{dataset.filter.label}</Label>
              <Select
                value={filter}
                onValueChange={(value) => {
                  setFilters((current) => ({ ...current, [dataset.id]: value }));
                }}
              >
                <SelectTrigger id="report-filter" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUES}>All</SelectItem>
                  {dataset.filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <ColumnPicker
            columns={dataset.columns}
            value={columnIds}
            onValueChange={(ids) => {
              setColumnChoices((current) => ({ ...current, [dataset.id]: ids }));
            }}
          />

          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <Button
              className="flex-1"
              size="lg"
              onClick={onGenerate}
              disabled={columnIds.length === 0 || generate.isPending}
            >
              <Play aria-hidden />
              {generate.isPending ? 'Generating…' : 'Generate report'}
            </Button>
            <Button
              className="flex-1"
              size="lg"
              variant="outline"
              onClick={() => void onDownload()}
              disabled={columnIds.length === 0 || generate.isPending}
            >
              <Download aria-hidden />
              Download Excel
            </Button>
          </div>
          {columnIds.length === 0 && (
            <p className="text-xs text-destructive">Pick at least one column.</p>
          )}
        </CardContent>
      </Card>

      <ReportPreview
        report={report}
        generating={generate.isPending}
        error={generate.error}
        stale={stale}
      />
    </div>
  );
}
