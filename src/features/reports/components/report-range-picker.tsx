import { CalendarIcon, CalendarRange } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { REPORT_RANGE_PRESETS, type ReportRangePreset } from '../constants';
import {
  formatReportDay,
  formatReportRange,
  istToday,
  matchReportPreset,
  parseReportDay,
  reportRangeDays,
  reportRangeProblem,
  resolveReportPreset,
} from '../report-range';
import type { ReportRange } from '../types';

const CUSTOM = 'custom';

function isPreset(value: string): value is ReportRangePreset {
  return REPORT_RANGE_PRESETS.some((preset) => preset.id === value);
}

interface ReportRangePickerProps {
  value: ReportRange;
  onValueChange: (range: ReportRange) => void;
}

/** Preset select plus a custom two-month calendar. Ranges are IST calendar days. */
export function ReportRangePicker({ value, onValueChange }: ReportRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const preset = matchReportPreset(value) ?? CUSTOM;
  const today = istToday();

  const openCustom = () => {
    setDraft({ from: parseReportDay(value.from), to: parseReportDay(value.to) });
    setOpen(true);
  };

  const draftRange =
    draft?.from && draft.to
      ? { from: formatReportDay(draft.from), to: formatReportDay(draft.to) }
      : undefined;
  const problem = draftRange ? reportRangeProblem(draftRange) : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={preset}
        onValueChange={(next) => {
          if (isPreset(next)) onValueChange(resolveReportPreset(next));
          // Let the select close and restore focus first, or the popover dismisses itself.
          else window.setTimeout(openCustom, 0);
        }}
      >
        <SelectTrigger className="h-9 w-44" aria-label="Report period">
          <CalendarRange aria-hidden className="text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REPORT_RANGE_PRESETS.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Custom range</SelectItem>
        </SelectContent>
      </Select>

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) openCustom();
          else setOpen(false);
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 font-normal" aria-label="Pick custom dates">
            <CalendarIcon aria-hidden />
            {formatReportRange(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draft}
            onSelect={setDraft}
            defaultMonth={draft?.from}
            disabled={{ after: today }}
            endMonth={today}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3">
            <p className={problem ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
              {problem ??
                (draftRange
                  ? `${String(reportRangeDays(draftRange))} days`
                  : 'Pick a start and an end date.')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!draftRange || Boolean(problem)}
                onClick={() => {
                  if (!draftRange) return;
                  onValueChange(draftRange);
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
