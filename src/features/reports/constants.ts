import { ChartBar, ChartLine, ChartPie, Table2 } from 'lucide-react';

export const REPORT_MODULES = [
  'Contacts',
  'Companies',
  'Deals',
  'Tasks',
  'Calls',
  'Meetings',
  'Attendance',
  'Breaks',
  'Call productivity',
  'Task productivity',
  'Appointment productivity',
  'User performance',
  'GSTR-1',
] as const;

export const REPORT_TYPES = [
  { value: 'bar', label: 'Bar chart', icon: ChartBar },
  { value: 'line', label: 'Line chart', icon: ChartLine },
  { value: 'pie', label: 'Pie chart', icon: ChartPie },
  { value: 'table', label: 'Summary table', icon: Table2 },
] as const;

export const reportKeys = { all: ['reports'] as const };
