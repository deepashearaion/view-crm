export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', variant: 'ai' },
  { value: 'half_day', label: 'Half day', variant: 'warm' },
  { value: 'on_leave', label: 'On leave', variant: 'human' },
  { value: 'absent', label: 'Absent', variant: 'destructive' },
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]['value'];

export interface AttendanceRecordDto {
  id: number;
  user_id: number;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  status: AttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  check_in_location: string;
  break_minutes: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  location: string;
  breakMinutes: number;
  /** Worked minutes excluding breaks; null while still checked in. */
  workedMinutes: number | null;
}
