import { useMemo } from 'react';
import { parseISO, isSameDay } from 'date-fns';
import type { BlockedTime } from '../pages/FacilityDetailsPage';
import { formatTo12Hour } from '../utils/timeFormat';

interface TimelinePickerProps {
  date: string;
  openingTime: string;
  closingTime: string;
  blockedTimes: BlockedTime[];
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
}

const SLOT_MINUTES = 30;
// Render from early morning to late night — out-of-hours cells are shown white.
const DISPLAY_START_MIN = 5 * 60;       // 5:00 AM
const DISPLAY_END_MIN = 23 * 60 + 30;   // 11:30 PM (last cell starts here)

const toMins = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fromMins = (m: number) => {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

export function TimelinePicker({
  date,
  openingTime,
  closingTime,
  blockedTimes,
  startTime,
  endTime,
  onChange,
}: TimelinePickerProps) {
  const { cells, openMin, closeMin } = useMemo(() => {
    let openMin = toMins(openingTime);
    let closeMin = toMins(closingTime);
    // 24-hour parks → practical 6am–10pm window
    if (openMin === 0 && (closeMin === 0 || closeMin >= 23 * 60 + 59)) {
      openMin = 6 * 60;
      closeMin = 22 * 60;
    }
    const cells: number[] = [];
    for (let m = DISPLAY_START_MIN; m <= DISPLAY_END_MIN; m += SLOT_MINUTES) {
      cells.push(m);
    }
    return { cells, openMin, closeMin };
  }, [openingTime, closingTime]);

  const dayBlocked = useMemo(() => {
    if (!date) return [];
    const target = parseISO(date);
    return blockedTimes
      .filter((b) => {
        try {
          return isSameDay(parseISO(b.date), target);
        } catch {
          return false;
        }
      })
      .map((b) => ({ start: toMins(b.start_local), end: toMins(b.end_local) }));
  }, [blockedTimes, date]);

  const isOutOfHours = (m: number) => m < openMin || m + SLOT_MINUTES > closeMin;
  const isBlockedCell = (m: number) =>
    dayBlocked.some((b) => m < b.end && m + SLOT_MINUTES > b.start);

  const selStart = startTime ? toMins(startTime) : null;
  const selEnd = endTime ? toMins(endTime) : null;
  const isSelectedCell = (m: number) =>
    selStart !== null && selEnd !== null && m >= selStart && m + SLOT_MINUTES <= selEnd;
  const isPartialStart = (m: number) =>
    selStart !== null && selEnd === null && m === selStart;

  const hasConflictBetween = (a: number, b: number) => {
    for (let m = a; m < b; m += SLOT_MINUTES) {
      if (isBlockedCell(m) || isOutOfHours(m)) return true;
    }
    return false;
  };

  const handleClick = (m: number) => {
    if (isOutOfHours(m) || isBlockedCell(m)) return;
    const cellStart = m;
    const cellEnd = m + SLOT_MINUTES;

    // fresh selection if nothing set OR both set
    if (selStart === null || selEnd !== null) {
      onChange(fromMins(cellStart), fromMins(cellEnd));
      return;
    }
    // start set, no end → try to set end
    if (cellStart <= selStart) {
      onChange(fromMins(cellStart), fromMins(cellStart + SLOT_MINUTES));
      return;
    }
    if (hasConflictBetween(selStart, cellEnd)) {
      onChange(fromMins(cellStart), fromMins(cellEnd));
    } else {
      onChange(fromMins(selStart), fromMins(cellEnd));
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-background w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tap cells to choose start & end
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Swatch className="bg-green-400" label="Open" />
          <Swatch className="bg-red-500" label="Occupied" />
          <Swatch className="bg-blue-500" label="Selected" />
          <Swatch className="bg-white border border-border" label="Closed" />
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto pb-2">
        <div className="inline-flex gap-0.5 pt-5">
          {cells.map((m) => {
            const outside = isOutOfHours(m);
            const blocked = !outside && isBlockedCell(m);
            const selected = !outside && !blocked && isSelectedCell(m);
            const partial = !outside && !blocked && isPartialStart(m);

            let cls = 'bg-green-400 hover:bg-green-500 cursor-pointer';
            if (selected || partial) cls = 'bg-blue-500 text-white cursor-pointer';
            if (blocked) cls = 'bg-red-500 cursor-not-allowed';
            if (outside) cls = 'bg-white border border-border cursor-not-allowed';

            const showLabel = m % 60 === 0;
            const hour = Math.floor(m / 60);
            const label = showLabel
              ? `${((hour + 11) % 12) + 1}${hour < 12 ? 'a' : 'p'}`
              : '';

            const tip = outside
              ? `${formatTo12Hour(fromMins(m))} — closed`
              : blocked
              ? `${formatTo12Hour(fromMins(m))} — occupied`
              : selected || partial
              ? `${formatTo12Hour(fromMins(m))} — selected`
              : `${formatTo12Hour(fromMins(m))} — available`;

            return (
              <button
                key={m}
                type="button"
                onClick={() => handleClick(m)}
                disabled={outside || blocked}
                title={tip}
                aria-label={tip}
                className={`relative w-8 h-8 rounded-sm transition-colors ${cls}`}
              >
                {showLabel && (
                  <span className="absolute -top-4 left-0 text-[10px] font-medium text-muted-foreground">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {startTime && endTime ? (
        <p className="text-xs text-muted-foreground mt-1">
          Selected: <span className="font-medium text-foreground">{formatTo12Hour(startTime)} – {formatTo12Hour(endTime)}</span>
        </p>
      ) : startTime ? (
        <p className="text-xs text-muted-foreground mt-1">
          Start at <span className="font-medium text-foreground">{formatTo12Hour(startTime)}</span> — tap an end cell.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">
          Tap a green cell to pick your start time.
        </p>
      )}
    </div>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block size-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}