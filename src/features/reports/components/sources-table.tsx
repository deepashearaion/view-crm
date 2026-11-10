import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPaise } from '@/lib/format';

import { formatNumber, formatPercent } from '../report-format';
import type { SourceReportRow } from '../types';

/** Lead sources ranked by the API: leads, hot leads, customers and won value. */
export function SourcesTable({ rows }: { rows: SourceReportRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Leads</TableHead>
          <TableHead className="text-right">Hot</TableHead>
          <TableHead className="text-right">Customers</TableHead>
          <TableHead className="text-right">Conversion</TableHead>
          <TableHead className="text-right">Won value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.source}>
            <TableCell className="font-medium">
              {row.unknown ? <span className="text-muted-foreground">Unknown</span> : row.source}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatNumber(row.leads)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatNumber(row.hotLeads)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatNumber(row.customers)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPercent(row.conversionPercent)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatPaise(row.wonPaise)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
