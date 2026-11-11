import { useState, type SyntheticEvent } from 'react';
import { toast } from 'sonner';

import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { errorMessage } from '@/services';

import { useLogCall } from '../call-recordings/hooks/use-calls';
import {
  CALL_DIRECTIONS,
  CALL_OUTCOMES,
  type CallDirection,
  type CallOutcome,
} from '../call-recordings/types';
import type { ContactRef } from '../types';

/** `YYYY-MM-DDTHH:mm` in local time, for a datetime-local input. */
function localDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface LogCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactRef;
}

/** Records a call with a contact by hand: direction, outcome, when, how long, notes. */
export function LogCallDialog({ open, onOpenChange, contact }: LogCallDialogProps) {
  const numbers = [contact.mobile, contact.alternateMobile].filter(Boolean);
  const logCall = useLogCall();

  const [direction, setDirection] = useState<CallDirection>('outbound');
  const [outcome, setOutcome] = useState<CallOutcome>('connected');
  const [phone, setPhone] = useState(numbers[0] ?? '');
  const [when, setWhen] = useState(() => localDateTime(new Date()));
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  const [notes, setNotes] = useState('');
  const [problem, setProblem] = useState<string>();

  const reset = () => {
    setDirection('outbound');
    setOutcome('connected');
    setPhone(numbers[0] ?? '');
    setWhen(localDateTime(new Date()));
    setMinutes('5');
    setSeconds('0');
    setNotes('');
    setProblem(undefined);
    logCall.reset();
  };

  const connected = outcome === 'connected';

  /** The first problem with the form, if any. */
  const validate = (startedAt: Date, durationSeconds: number): string | undefined => {
    if (!phone.trim()) return 'Enter the number that was called.';
    if (Number.isNaN(startedAt.getTime())) return 'Enter when the call happened.';
    if (startedAt.getTime() > Date.now() + 60_000) return 'The call can’t be in the future.';
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0 || Number(seconds) >= 60) {
      return 'Enter a valid duration (seconds 0–59).';
    }
    return undefined;
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const startedAt = new Date(when);
    const durationSeconds = connected ? Number(minutes) * 60 + Number(seconds) : 0;
    const invalid = validate(startedAt, durationSeconds);
    setProblem(invalid);
    if (invalid) return;
    logCall.mutate(
      {
        direction,
        outcome,
        phone: phone.trim(),
        contact_id: Number(contact.id),
        started_at: startedAt.toISOString(),
        duration_seconds: durationSeconds,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Call with ${contact.fullName || 'this contact'} logged.`);
          onOpenChange(false);
          reset();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Log a call</DialogTitle>
            <DialogDescription>
              Record a call with {contact.fullName || 'this contact'} that wasn’t captured
              automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="call-direction">Direction</Label>
              <Select
                value={direction}
                onValueChange={(value) => {
                  setDirection(value as CallDirection);
                }}
              >
                <SelectTrigger id="call-direction" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALL_DIRECTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="call-outcome">Outcome</Label>
              <Select
                value={outcome}
                onValueChange={(value) => {
                  setOutcome(value as CallOutcome);
                }}
              >
                <SelectTrigger id="call-outcome" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALL_OUTCOMES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="call-phone">Number</Label>
            {numbers.length > 1 ? (
              <Select value={phone} onValueChange={setPhone}>
                <SelectTrigger id="call-phone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {numbers.map((number) => (
                    <SelectItem key={number} value={number}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="call-phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                }}
                placeholder="+91 98400 12345"
              />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-1.5">
              <Label htmlFor="call-when">When</Label>
              <Input
                id="call-when"
                type="datetime-local"
                value={when}
                max={localDateTime(new Date())}
                onChange={(event) => {
                  setWhen(event.target.value);
                }}
              />
            </div>
            <fieldset className="grid gap-1.5" disabled={!connected}>
              <legend className="mb-1.5 text-sm font-medium">Duration</legend>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={connected ? minutes : '0'}
                  onChange={(event) => {
                    setMinutes(event.target.value);
                  }}
                  className="w-16"
                  aria-label="Minutes"
                />
                <span className="text-xs text-muted-foreground">min</span>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  inputMode="numeric"
                  value={connected ? seconds : '0'}
                  onChange={(event) => {
                    setSeconds(event.target.value);
                  }}
                  className="w-16"
                  aria-label="Seconds"
                />
                <span className="text-xs text-muted-foreground">sec</span>
              </div>
            </fieldset>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="call-notes">Notes</Label>
            <Textarea
              id="call-notes"
              rows={3}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
              }}
              placeholder="What was discussed, next steps…"
            />
          </div>

          {(problem ?? logCall.error) && (
            <InlineAlert>
              {problem ?? errorMessage(logCall.error, 'Couldn’t log the call.')}
            </InlineAlert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={logCall.isPending}>
              {logCall.isPending ? 'Saving…' : 'Log call'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
