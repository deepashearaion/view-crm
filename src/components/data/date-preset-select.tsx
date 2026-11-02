import { CalendarRange } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DATE_PRESETS, isDatePreset, type DatePreset } from '@/lib/date-range';

interface DatePresetSelectProps {
  value: DatePreset;
  onValueChange: (value: DatePreset) => void;
  /** What the range applies to, e.g. "Created". Used for the accessible name. */
  label?: string;
}

export function DatePresetSelect({
  value,
  onValueChange,
  label = 'Date range',
}: DatePresetSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isDatePreset(next)) onValueChange(next);
      }}
    >
      <SelectTrigger className="h-9 w-40" aria-label={label}>
        <CalendarRange aria-hidden className="text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_PRESETS.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
