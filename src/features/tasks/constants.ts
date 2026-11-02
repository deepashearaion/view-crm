import { CalendarClock, FileText, Mail, MonitorPlay, Phone, Presentation } from 'lucide-react';

export const TASK_TYPES = [
  { value: 'call', label: 'Follow-up call', icon: Phone },
  { value: 'meeting', label: 'Meeting', icon: CalendarClock },
  { value: 'email', label: 'Email follow-up', icon: Mail },
  { value: 'demo', label: 'Demo', icon: MonitorPlay },
  { value: 'presentation', label: 'Presentation', icon: Presentation },
  { value: 'quotation', label: 'Send quotation', icon: FileText },
] as const;

export function taskTypeByValue(value: string) {
  return TASK_TYPES.find((type) => type.value === value);
}

export const TASK_STATUSES = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
] as const;

export const taskKeys = {
  all: ['tasks'] as const,
  list: () => [...taskKeys.all, 'list'] as const,
  alerts: () => [...taskKeys.all, 'alerts'] as const,
};
