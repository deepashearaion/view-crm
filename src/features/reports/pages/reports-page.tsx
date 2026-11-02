import { BarChart3, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { UserChip } from '@/components/data/user-chip';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserLookup } from '@/features/auth';
import { formatDate } from '@/lib/format';

import { CreateReportDialog } from '../components/create-report-dialog';
import { REPORT_MODULES, REPORT_TYPES } from '../constants';
import { useDeleteReport, useReports } from '../hooks/use-reports';
import type { Report } from '../types';

const ALL = 'all';

export default function ReportsPage() {
  const { data: reports = [], isPending, error } = useReports();
  const users = useUserLookup();
  const deleteReport = useDeleteReport();
  const [module, setModule] = useState<string>(ALL);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Report | null>(null);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports.filter(
      (report) =>
        (module === ALL || report.module === module) &&
        (!query ||
          report.name.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query)),
    );
  }, [reports, module, search]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Reports"
        description="Saved reports across contacts, deals, tasks, calls and attendance."
        actions={
          <Button
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            <Plus aria-hidden />
            New report
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onValueChange={setSearch} placeholder="Search reports…" />
        <Select value={module} onValueChange={setModule}>
          <SelectTrigger className="h-9 w-52" aria-label="Filter by module">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All modules</SelectItem>
            {REPORT_MODULES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={BarChart3}
          title="Couldn’t load reports"
          description="Please refresh to try again."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title={reports.length ? 'No matching reports' : 'No reports yet'}
          description={
            reports.length
              ? 'Try another module or search.'
              : 'Create your first report to track what matters.'
          }
          actions={
            reports.length === 0 && (
              <Button
                onClick={() => {
                  setCreateOpen(true);
                }}
              >
                <Plus aria-hidden />
                New report
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((report) => {
            const type = REPORT_TYPES.find((item) => item.value === report.type);
            return (
              <li key={report.id}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {type && <type.icon aria-hidden className="size-4" />}
                    </div>
                    <CardTitle>{report.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {report.description ||
                        `${type?.label ?? 'Report'} of ${report.module.toLowerCase()}`}
                    </CardDescription>
                    <CardAction>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${report.name}`}
                          >
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                              setPendingDelete(report);
                            }}
                          >
                            <Trash2 aria-hidden />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{report.module}</Badge>
                      {type && <Badge variant="outline">{type.label}</Badge>}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between text-xs text-muted-foreground">
                    <UserChip
                      name={report.ownerId ? users.get(report.ownerId)?.name : undefined}
                      emptyLabel="System"
                    />
                    <span>{formatDate(report.createdAt)}</span>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <CreateReportDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this report?"
        description={`“${pendingDelete?.name ?? ''}” will be removed for everyone.`}
        confirmLabel="Delete"
        destructive
        pending={deleteReport.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteReport.mutate(pendingDelete.id, {
            onSuccess: () => {
              toast.success('Report deleted.');
              setPendingDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
