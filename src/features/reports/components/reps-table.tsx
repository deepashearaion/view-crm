import { UserChip } from '@/components/data/user-chip';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { USER_ROLE_LABELS } from '@/features/auth';
import { formatPaise } from '@/lib/format';

import { formatNumber, formatPercent } from '../report-format';
import type { RepReportRow, ReportCount } from '../types';

function CountCell({ value }: { value: ReportCount }) {
  return (
    <TableCell className="text-right tabular-nums">
      <span className="block">{formatNumber(value.count)}</span>
      <span className="block text-xs text-muted-foreground">{formatPaise(value.valuePaise)}</span>
    </TableCell>
  );
}

/** Per-user performance for the period. Hidden from reps. */
export function RepsTable({ rows }: { rows: RepReportRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team member</TableHead>
          <TableHead className="text-right">Leads</TableHead>
          <TableHead className="text-right">Open deals</TableHead>
          <TableHead className="text-right">Won</TableHead>
          <TableHead className="text-right">Lost</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
          <TableHead className="text-right">Overdue tasks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.userId}>
            <TableCell>
              <span className="flex items-center gap-2">
                <UserChip name={row.name} />
                <Badge variant="outline">{USER_ROLE_LABELS[row.role]}</Badge>
              </span>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(row.leadsAssigned)}
            </TableCell>
            <CountCell value={row.openDeals} />
            <CountCell value={row.won} />
            <CountCell value={row.lost} />
            <TableCell className="text-right tabular-nums">
              {formatPercent(row.winRatePercent)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.overdueTasks > 0 ? (
                <Badge variant="destructive">{formatNumber(row.overdueTasks)}</Badge>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
