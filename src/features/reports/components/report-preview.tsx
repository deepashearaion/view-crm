import { FileSpreadsheet } from 'lucide-react';

import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatDateTime, plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CellFormat, CellValue } from '@/lib/xlsx';
import { errorMessage } from '@/services';

import { describeReport, type GeneratedReport } from '../builder/run-report';
import { formatNumber, formatPercent } from '../report-format';

/** The preview stays quick on large lists; the Excel file always has every row. */
const PREVIEW_ROWS = 200;

const NUMERIC: ReadonlySet<CellFormat> = new Set(['integer', 'decimal', 'money', 'percent']);
const SUMMABLE: ReadonlySet<CellFormat> = new Set(['integer', 'money']);

function formatCell(value: CellValue, format: CellFormat): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (format === 'money') return formatCurrency(value);
    if (format === 'percent') return formatPercent(value);
    return formatNumber(value);
  }
  if (format === 'date') return formatDate(value);
  if (format === 'datetime') return formatDateTime(value);
  return value;
}

interface ReportPreviewProps {
  report: GeneratedReport | undefined;
  generating: boolean;
  error: unknown;
  /** Settings changed since this report was generated. */
  stale: boolean;
}

export function ReportPreview({ report, generating, error, stale }: ReportPreviewProps) {
  if (generating && !report) {
    return (
      <Card aria-busy="true" aria-label="Generating report">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-8" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <div className="space-y-3">
        {Boolean(error) && (
          <InlineAlert>{errorMessage(error, 'Couldn’t generate this report.')}</InlineAlert>
        )}
        <EmptyState
          icon={FileSpreadsheet}
          title="Build a report"
          description="Pick a report, a period and the columns you want, then select Generate report to preview it here or Download Excel to save it."
          className="h-full min-h-80"
        />
      </div>
    );
  }

  const { period, filter } = describeReport(report);
  const shown = report.rows.slice(0, PREVIEW_ROWS);
  const totals = report.columns.map((column, index) =>
    SUMMABLE.has(column.format)
      ? report.rows.reduce<number>((sum, row) => {
          const value = row[index];
          return typeof value === 'number' ? sum + value : sum;
        }, 0)
      : undefined,
  );
  const showTotals = report.rows.length > 1 && totals.some((total) => total !== undefined);

  return (
    <Card className={cn('min-w-0', generating && 'opacity-60')} aria-busy={generating}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {report.dataset.label}
          <Badge variant="secondary">{plural(report.rows.length, 'row')}</Badge>
          {stale && <Badge variant="outline">Settings changed: generate again</Badge>}
        </CardTitle>
        <CardDescription>
          {period}
          {filter && ` · ${filter}`} · Generated {formatDateTime(report.generatedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Boolean(error) && (
          <InlineAlert>{errorMessage(error, 'Couldn’t generate this report.')}</InlineAlert>
        )}
        {report.rows.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing matches this period and filter.
          </p>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  {report.columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        'whitespace-nowrap',
                        NUMERIC.has(column.format) && 'text-right',
                      )}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {report.columns.map((column, index) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          'max-w-80 truncate',
                          NUMERIC.has(column.format) && 'text-right tabular-nums',
                        )}
                        title={typeof row[index] === 'string' ? row[index] : undefined}
                      >
                        {formatCell(row[index], column.format)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              {showTotals && (
                <TableFooter className="sticky bottom-0">
                  <TableRow>
                    {report.columns.map((column, index) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          'font-semibold whitespace-nowrap',
                          NUMERIC.has(column.format) && 'text-right tabular-nums',
                        )}
                      >
                        {index === 0 && totals[0] === undefined
                          ? 'Total'
                          : totals[index] === undefined
                            ? ''
                            : formatCell(totals[index], column.format)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        )}
        {report.rows.length > PREVIEW_ROWS && (
          <p className="text-xs text-muted-foreground">
            Showing the first {formatNumber(PREVIEW_ROWS)} of {formatNumber(report.rows.length)}{' '}
            rows. The Excel file has all of them.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
