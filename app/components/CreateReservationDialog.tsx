import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Facility } from '../types';
import type { BlockedTime } from '../pages/FacilityDetailsPage';
import { formatTo12Hour } from '../utils/timeFormat';
import { parseISO, isSameDay } from 'date-fns';

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: Facility;
  blockedTimes: BlockedTime[];
  onCreateReservation: (data: {
    name: string;
    email: string;
    phone: string;
    sport: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) => void;
}

/** Generate 15-minute time slots from openingTime to closingTime (inclusive) */
function generate15MinSlots(openingTime: string, closingTime: string): string[] {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const fromMins = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  let open = toMins(openingTime);
  let close = toMins(closingTime);

  // 24-hour parks: use 6am–10pm as practical range
  if (open === 0 && (close === 0 || close >= 23 * 60 + 59)) {
    open = 6 * 60;
    close = 22 * 60;
  }

  const slots: string[] = [];
  for (let m = open; m <= close; m += 15) {
    slots.push(fromMins(m));
  }
  return slots;
}

/** Get free windows for a given date by subtracting blocked times from facility hours */
function getFreeWindows(
  date: string,
  openingTime: string,
  closingTime: string,
  blockedTimes: BlockedTime[]
): Array<{ start: string; end: string }> {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  let open = toMins(openingTime);
  let close = toMins(closingTime);
  if (open === 0 && (close === 0 || close >= 23 * 60 + 59)) {
    open = 6 * 60;
    close = 22 * 60;
  }

  const dayBlocked = blockedTimes
    .filter((b) => b.date === date)
    .map((b) => ({ start: toMins(b.start_local), end: toMins(b.end_local) }))
    .sort((a, b) => a.start - b.start);

  const windows: Array<{ start: string; end: string }> = [];
  const fromMins = (m: number) => {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  let cursor = open;
  for (const b of dayBlocked) {
    const bs = Math.max(b.start, open);
    const be = Math.min(b.end, close);
    if (cursor < bs) windows.push({ start: fromMins(cursor), end: fromMins(bs) });
    if (be > cursor) cursor = be;
  }
  if (cursor < close) windows.push({ start: fromMins(cursor), end: fromMins(close) });
  return windows;
}

/** Check whether a proposed [start, end) overlaps any blocked time on the given date */
function hasConflict(start: string, end: string, dayBlocked: BlockedTime[]): boolean {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const s = toMins(start);
  const e = toMins(end);
  return dayBlocked.some((b) => {
    const bs = toMins(b.start_local);
    const be = toMins(b.end_local);
    return s < be && e > bs;
  });
}

export function CreateReservationDialog({
  open,
  onOpenChange,
  facility,
  blockedTimes,
  onCreateReservation,
}: CreateReservationDialogProps) {
  const [sport, setSport] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('10');

  const timeSlots = useMemo(
    () => generate15MinSlots(facility.openingTime, facility.closingTime),
    [facility.openingTime, facility.closingTime]
  );

  const dayBlocked = useMemo(() => {
    if (!date) return [];
    return blockedTimes.filter((b) => {
      try { return isSameDay(parseISO(b.date), parseISO(date)); } catch { return false; }
    });
  }, [blockedTimes, date]);

  const freeWindows = useMemo(() => {
    if (!date) return [];
    return getFreeWindows(date, facility.openingTime, facility.closingTime, dayBlocked);
  }, [date, facility.openingTime, facility.closingTime, dayBlocked]);

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const startOptions = timeSlots.slice(0, -1); // exclude last slot (can't start at close)
  const endOptions = startTime
    ? timeSlots.filter((t) => toMins(t) > toMins(startTime))
    : [];

  const isStartBlocked = (t: string) =>
    dayBlocked.some((b) => toMins(t) >= toMins(b.start_local) && toMins(t) < toMins(b.end_local));

  const isEndConflicting = (t: string) =>
    startTime ? hasConflict(startTime, t, dayBlocked) : false;

  const durationMins =
    startTime && endTime ? toMins(endTime) - toMins(startTime) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sport || !date || !startTime || !endTime) return;
    onCreateReservation({
      name: '',
      email: '',
      phone: '',
      sport,
      date,
      startTime,
      endTime,
      capacity: parseInt(capacity),
    });
    setSport('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setCapacity('10');
    onOpenChange(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setStartTime('');
    setEndTime('');
  };

  const handleStartChange = (val: string) => {
    setStartTime(val);
    setEndTime('');
  };

  const canSubmit = sport && date && startTime && endTime && !isEndConflicting(endTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Post a Pickup Game</DialogTitle>
            <DialogDescription>{facility.name}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Sport & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sport / Activity *</Label>
                <Select value={sport} onValueChange={setSport} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {facility.sports.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Max Players *</Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger id="capacity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} players</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Schedule preview — shown once date is picked */}
            {date && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Schedule for this day
                </p>

                {dayBlocked.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="size-4 flex-shrink-0" />
                    <span>Open all day — no official events scheduled</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {dayBlocked
                      .sort((a, b) => a.start_local.localeCompare(b.start_local))
                      .map((b) => (
                        <div key={b.booking_id} className="flex items-center gap-2">
                          <XCircle className="size-3.5 text-destructive flex-shrink-0" />
                          <span className="text-xs font-medium text-destructive">
                            {formatTo12Hour(b.start_local)} – {formatTo12Hour(b.end_local)}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">{b.event_name}</span>
                        </div>
                      ))}
                  </div>
                )}

                {freeWindows.length > 0 && (
                  <div className="pt-1 border-t space-y-1">
                    <p className="text-xs text-muted-foreground">Available times:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {freeWindows.map((w, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-success border-success/30 bg-success/10">
                          <CheckCircle className="size-3 mr-1" />
                          {formatTo12Hour(w.start)} – {formatTo12Hour(w.end)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Time pickers — shown once date is picked */}
            {date && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start time *</Label>
                  <Select value={startTime} onValueChange={handleStartChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a start time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {startOptions.map((t) => {
                        const blocked = isStartBlocked(t);
                        return (
                          <SelectItem key={t} value={t} disabled={blocked}>
                            <span className={blocked ? 'text-muted-foreground line-through' : ''}>
                              {formatTo12Hour(t)}
                            </span>
                            {blocked && (
                              <span className="ml-1 text-xs text-destructive">unavailable</span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>End time *</Label>
                  <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                    <SelectTrigger>
                      <SelectValue placeholder={startTime ? 'Choose an end time' : 'Choose a start time first'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {endOptions.map((t) => {
                        const conflict = isEndConflicting(t);
                        return (
                          <SelectItem key={t} value={t} disabled={conflict}>
                            <span className={conflict ? 'text-muted-foreground line-through' : ''}>
                              {formatTo12Hour(t)}
                            </span>
                            {conflict && (
                              <span className="ml-1 text-xs text-destructive">overlaps an event</span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Duration badge */}
            {durationMins && durationMins > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>
                  {durationMins >= 60
                    ? `${Math.floor(durationMins / 60)}h${durationMins % 60 ? ` ${durationMins % 60}m` : ''}`
                    : `${durationMins}m`}{' '}
                  session — {formatTo12Hour(startTime)} to {formatTo12Hour(endTime)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Post Pickup Game
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
