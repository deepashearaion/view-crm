import type { ColumnDef } from '@tanstack/react-table';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { CalendarCheck, Clock, LogIn, LogOut, UserCheck, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableColumnHeader } from '@/components/data/data-table';
import { PageHeader } from '@/components/data/page-header';
import { StatCard } from '@/components/data/stat-card';
import { UserChip } from '@/components/data/user-chip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionUser, useUsers, type User } from '@/features/auth';
import { errorMessage } from '@/services';

import { formatMinutes, toDayKey } from '../api/attendance';
import { useAttendance, useCheckIn, useCheckOut } from '../hooks/use-attendance';
import { ATTENDANCE_STATUSES, type AttendanceRecord, type AttendanceStatus } from '../types';

interface DayRow {
  user: User;
  record: AttendanceRecord | undefined;
}

const timeOf = (iso: string | null) => (iso ? format(new Date(iso), 'h:mm a') : '—');

function StatusBadge({ status }: { status: AttendanceStatus | undefined }) {
  const meta = ATTENDANCE_STATUSES.find((item) => item.value === status);
  if (!meta) return <Badge variant="outline">No record</Badge>;
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

const columns: ColumnDef<DayRow>[] = [
  {
    id: 'user',
    accessorFn: (row) => row.user.name,
    meta: { label: 'Team member' },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Team member" />,
    cell: ({ row }) => <UserChip name={row.original.user.name} />,
  },
  {
    id: 'status',
    accessorFn: (row) => row.record?.status ?? '',
    meta: { label: 'Status' },
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.record?.status} />,
  },
  {
    id: 'checkIn',
    accessorFn: (row) => row.record?.checkIn ?? '',
    meta: { label: 'First in', className: 'tabular-nums' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="First in" />,
    cell: ({ row }) => timeOf(row.original.record?.checkIn ?? null),
  },
  {
    id: 'checkOut',
    accessorFn: (row) => row.record?.checkOut ?? '',
    meta: { label: 'Last out', className: 'tabular-nums' },
    header: 'Last out',
    cell: ({ row }) =>
      row.original.record?.checkIn && !row.original.record.checkOut ? (
        <Badge variant="ai">Working</Badge>
      ) : (
        timeOf(row.original.record?.checkOut ?? null)
      ),
  },
  {
    id: 'breaks',
    accessorFn: (row) => row.record?.breakMinutes ?? 0,
    meta: { label: 'Breaks', className: 'tabular-nums' },
    header: 'Breaks',
    cell: ({ row }) =>
      row.original.record?.checkIn ? formatMinutes(row.original.record.breakMinutes) : '—',
  },
  {
    id: 'worked',
    accessorFn: (row) => row.record?.workedMinutes ?? -1,
    meta: { label: 'Worked', className: 'tabular-nums' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Worked" />,
    cell: ({ row }) => formatMinutes(row.original.record?.workedMinutes ?? null),
  },
  {
    id: 'location',
    accessorFn: (row) => row.record?.location ?? '',
    meta: { label: 'Check-in location' },
    header: 'Check-in location',
    cell: ({ getValue }) => getValue<string>() || <span className="text-muted-foreground">—</span>,
  },
];

export default function AttendancePage() {
  const sessionUser = useSessionUser();
  const { data: users = [] } = useUsers();
  const [day, setDay] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date());
  const [monthUser, setMonthUser] = useState<string>('');
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const dayKey = toDayKey(day);
  const dayQuery = useAttendance(dayKey, dayKey);
  const monthQuery = useAttendance(toDayKey(startOfMonth(month)), toDayKey(endOfMonth(month)));

  const myId = sessionUser?.id === undefined ? '' : String(sessionUser.id);
  const selectedMonthUser = monthUser || myId || users[0]?.id || '';
  const today = toDayKey(new Date());
  const todayQuery = useAttendance(today, today);
  const myToday = todayQuery.data?.find((record) => record.userId === myId);

  const rows = useMemo<DayRow[]>(
    () =>
      users.map((user) => ({
        user,
        record: dayQuery.data?.find((record) => record.userId === user.id),
      })),
    [users, dayQuery.data],
  );

  const summary = useMemo(() => {
    const records = dayQuery.data ?? [];
    const present = records.filter(
      (record) => record.status === 'present' || record.status === 'half_day',
    );
    const worked = present
      .map((record) => record.workedMinutes)
      .filter((value): value is number => value !== null);
    return {
      present: present.length,
      absent: users.length - present.length,
      average: worked.length
        ? Math.round(worked.reduce((sum, value) => sum + value, 0) / worked.length)
        : null,
    };
  }, [dayQuery.data, users.length]);

  const monthStatus = useMemo(() => {
    const byStatus: Record<AttendanceStatus, Date[]> = {
      present: [],
      half_day: [],
      on_leave: [],
      absent: [],
    };
    for (const record of monthQuery.data ?? []) {
      if (record.userId === selectedMonthUser)
        byStatus[record.status].push(new Date(`${record.date}T12:00:00`));
    }
    return byStatus;
  }, [monthQuery.data, selectedMonthUser]);

  const handleCheck = () => {
    const onError = (error: unknown) => toast.error(errorMessage(error));
    if (myToday?.checkIn && !myToday.checkOut) {
      checkOut.mutate(undefined, {
        onSuccess: () => toast.success('Checked out. See you tomorrow!'),
        onError,
      });
    } else {
      checkIn.mutate('Office', { onSuccess: () => toast.success('Checked in.'), onError });
    }
  };

  const checkedIn = Boolean(myToday?.checkIn && !myToday.checkOut);
  const doneForDay = Boolean(myToday?.checkOut);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Attendance"
        description="Who’s in today, working hours and monthly history."
        actions={
          <Button
            variant={checkedIn ? 'outline' : 'default'}
            disabled={doneForDay || checkIn.isPending || checkOut.isPending || !myId}
            onClick={handleCheck}
          >
            {checkedIn ? <LogOut aria-hidden /> : <LogIn aria-hidden />}
            {doneForDay ? 'Checked out for today' : checkedIn ? 'Check out' : 'Check in'}
          </Button>
        }
      />

      <Tabs defaultValue="day">
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Present"
              icon={UserCheck}
              value={summary.present}
              loading={dayQuery.isPending}
              hint={`of ${String(users.length)} team members`}
            />
            <StatCard
              label="Not checked in"
              icon={UserX}
              value={summary.absent}
              loading={dayQuery.isPending}
            />
            <StatCard
              label="Average worked"
              icon={Clock}
              value={formatMinutes(summary.average)}
              loading={dayQuery.isPending}
            />
          </div>
          <DataTable
            label={`Attendance for ${format(day, 'd MMM yyyy')}`}
            storageKey="attendance-day"
            columns={columns}
            data={rows}
            getRowId={(row) => row.user.id}
            isLoading={dayQuery.isPending}
            error={dayQuery.error}
            onRetry={() => void dayQuery.refetch()}
            toolbar={() => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <CalendarCheck aria-hidden />
                    {format(day, 'EEE, d MMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={day}
                    onSelect={(value) => {
                      if (value) setDay(value);
                    }}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>Monthly overview</CardTitle>
              <Select value={selectedMonthUser} onValueChange={setMonthUser}>
                <SelectTrigger className="h-9 w-52" aria-label="Team member">
                  <SelectValue placeholder="Team member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 md:flex-row md:items-start">
              <Calendar
                month={month}
                onMonthChange={setMonth}
                disabled={{ after: new Date() }}
                modifiers={monthStatus}
                modifiersClassNames={{
                  present: 'bg-ai-muted text-ai-muted-foreground rounded-md',
                  half_day: 'bg-lead-warm-muted text-lead-warm-muted-foreground rounded-md',
                  on_leave: 'bg-human-muted text-human-muted-foreground rounded-md',
                  absent: 'bg-destructive/10 text-destructive rounded-md',
                }}
                className="rounded-lg border [--cell-size:--spacing(10)]"
              />
              <ul className="space-y-2 text-sm" aria-label="Legend">
                {ATTENDANCE_STATUSES.map((status) => (
                  <li key={status.value} className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-muted-foreground tabular-nums">
                      {monthStatus[status.value].length} days
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
