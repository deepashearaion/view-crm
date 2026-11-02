import { format } from 'date-fns';

import { http } from '@/services';

import type { AttendanceRecord, AttendanceRecordDto } from '../types';

export const toDayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export function toRecord(dto: AttendanceRecordDto): AttendanceRecord {
  const worked =
    dto.check_in && dto.check_out
      ? Math.max(
          0,
          Math.round(
            (new Date(dto.check_out).getTime() - new Date(dto.check_in).getTime()) / 60_000,
          ) - dto.break_minutes,
        )
      : null;
  return {
    id: String(dto.id),
    userId: String(dto.user_id),
    date: dto.date,
    status: dto.status,
    checkIn: dto.check_in,
    checkOut: dto.check_out,
    location: dto.check_in_location,
    breakMinutes: dto.break_minutes,
    workedMinutes: worked,
  };
}

export async function fetchAttendance(
  range: { from: string; to: string },
  signal?: AbortSignal,
): Promise<AttendanceRecord[]> {
  const response = await http.get<{ records: AttendanceRecordDto[] }>('/api/attendance', {
    query: range,
    signal,
  });
  return response.records.map(toRecord);
}

export async function checkIn(location: string): Promise<AttendanceRecord> {
  const response = await http.post<{ record: AttendanceRecordDto }>('/api/attendance/check-in', {
    location,
  });
  return toRecord(response.record);
}

export async function checkOut(): Promise<AttendanceRecord> {
  const response = await http.post<{ record: AttendanceRecordDto }>('/api/attendance/check-out');
  return toRecord(response.record);
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${String(hours)}h ${String(rest).padStart(2, '0')}m` : `${String(rest)}m`;
}
