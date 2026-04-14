import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, Users, Building2 } from 'lucide-react';
import { TimeSlot, Facility, OfficialEvent } from '../types';
import { formatTo12Hour } from '../utils/timeFormat';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

interface CalendarViewProps {
  timeSlots: TimeSlot[];
  officialEvents: OfficialEvent[];
  facilities: Facility[];
  onSelectTimeSlot: (timeSlotId: string) => void;
  onSelectOfficialEvent: (eventId: string) => void;
  currentMonth: Date;
}

export function CalendarView({ timeSlots, officialEvents, facilities, onSelectTimeSlot, onSelectOfficialEvent, currentMonth }: CalendarViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group time slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {};
    timeSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [timeSlots]);

  // Group official events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, OfficialEvent[]> = {};
    officialEvents.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, [officialEvents]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = monthStart.getDay();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm bg-blue-50">
              {timeSlots.length} Recreational Sessions
            </Badge>
            <Badge variant="outline" className="text-sm bg-amber-50">
              {officialEvents.length} Official Events
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded bg-blue-500"></div>
            <span>Recreational Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded bg-amber-500"></div>
            <span>Official Events</span>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[140px] bg-muted/20 rounded-lg" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const daySessions = slotsByDate[dateStr] || [];
            const dayEvents = eventsByDate[dateStr] || [];
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const hasActivities = daySessions.length > 0 || dayEvents.length > 0;

            return (
              <div
                key={dateStr}
                className={`min-h-[140px] p-2 rounded-lg border-2 transition-all ${
                  isCurrentDay
                    ? 'border-primary bg-primary/5'
                    : hasActivities
                    ? 'border-border bg-card hover:border-primary/50'
                    : 'border-border/50 bg-card/50'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <div className={`text-sm font-semibold mb-2 ${isCurrentDay ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {/* Official Events */}
                  {dayEvents.slice(0, 2).map(event => {
                    return (
                      <div
                        key={event.id}
                        onClick={() => onSelectOfficialEvent(event.id)}
                        className="text-xs p-1.5 rounded cursor-pointer transition-all bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                      >
                        <div className="font-semibold truncate flex items-center gap-1">
                          <Building2 className="size-2.5 flex-shrink-0" />
                          <span className="truncate">{event.eventName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-80">
                          <Clock className="size-2.5" />
                          {formatTo12Hour(event.startTime)}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Recreational Sessions */}
                  {daySessions.slice(0, hasActivities ? 1 : 3).map(session => {
                    const isFull = session.currentParticipants >= session.capacity;
                    
                    return (
                      <div
                        key={session.id}
                        onClick={() => onSelectTimeSlot(session.id)}
                        className={`text-xs p-1.5 rounded cursor-pointer transition-all ${
                          isFull
                            ? 'bg-red-100 hover:bg-red-200 text-red-900'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                        }`}
                      >
                        <div className="font-semibold truncate">{session.sport}</div>
                        <div className="flex items-center gap-1 text-[10px] opacity-80">
                          <Clock className="size-2.5" />
                          {formatTo12Hour(session.startTime)}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-80">
                          <Users className="size-2.5" />
                          {session.currentParticipants}/{session.capacity}
                        </div>
                      </div>
                    );
                  })}
                  
                  {(daySessions.length + dayEvents.length) > 3 && (
                    <div className="text-[10px] text-center text-muted-foreground font-medium pt-1">
                      +{(daySessions.length + dayEvents.length) - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}