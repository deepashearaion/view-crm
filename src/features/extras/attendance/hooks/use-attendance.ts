import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { checkIn, checkOut, fetchAttendance } from '../api/attendance';

const attendanceKeys = {
  all: ['attendance'] as const,
  range: (from: string, to: string) => [...attendanceKeys.all, from, to] as const,
};

export function useAttendance(from: string, to: string) {
  return useQuery({
    queryKey: attendanceKeys.range(from, to),
    queryFn: ({ signal }) => fetchAttendance({ from, to }, signal),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
