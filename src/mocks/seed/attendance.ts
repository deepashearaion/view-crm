import type { AttendanceRecordDto, AttendanceStatus } from '@/features/extras';

const userIds = [1, 2, 3, 4, 7, 8, 14];
const locations = ['Office', 'Office', 'Client site', 'Remote'];

const dayKey = (date: Date) =>
  `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function at(date: Date, hours: number, minutes: number): string {
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value.toISOString();
}

/** Deterministic weekday attendance for the last ~60 days; today has partial check-ins. */
export function seedAttendance(now: Date = new Date()): AttendanceRecordDto[] {
  const records: AttendanceRecordDto[] = [];
  let id = 1;
  for (let offset = 60; offset >= 0; offset--) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    for (const userId of userIds) {
      const seed = (userId * 31 + offset * 7) % 23;
      // Leave the current user (7) un-checked today so Check in can be tried.
      if (offset === 0 && (userId === 7 || seed % 3 === 0)) continue;
      const status: AttendanceStatus =
        seed === 0 ? 'on_leave' : seed === 1 ? 'absent' : seed === 2 ? 'half_day' : 'present';
      const working = status === 'present' || status === 'half_day';
      const inMinutes = 9 * 60 + (seed % 5) * 9;
      const outMinutes = status === 'half_day' ? 13 * 60 + 30 : 18 * 60 + (seed % 4) * 11;
      records.push({
        id: id++,
        user_id: userId,
        date: dayKey(date),
        status,
        check_in: working ? at(date, Math.floor(inMinutes / 60), inMinutes % 60) : null,
        check_out:
          working && offset > 0 ? at(date, Math.floor(outMinutes / 60), outMinutes % 60) : null,
        check_in_location: working ? (locations[seed % locations.length] ?? 'Office') : '',
        break_minutes: working ? 30 + (seed % 3) * 10 : 0,
      });
    }
  }
  return records;
}

export { dayKey };
