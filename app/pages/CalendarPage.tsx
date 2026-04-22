import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Clock, MapPin, AlertCircle, ChevronLeft, ChevronRight, Trophy, Dumbbell, Wrench, Star, Users } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, isPast, isFuture, subMonths as subMo } from 'date-fns';
import { fetchTimeSlots, fetchFacilities } from '../lib/api';


interface Event25Live {
  id: string;
  title: string;
  facilityId: string;
  facilityName: string;
  startTime: string;
  endTime: string;
  eventType: 'practice' | 'game' | 'tournament' | 'maintenance' | 'pickup' | 'other';
  organization: string;
  description?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  affectsRecreational: boolean;
  attendees?: number;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'practice' | 'game' | 'tournament' | 'maintenance' | 'pickup' | 'other'>('all');
  const [filterFacility, setFilterFacility] = useState<'all' | string>('all');
  const [events, setEvents] = useState<Event25Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  

  // Fetch events whenever the displayed month changes — load ±1 month for smooth navigation
// Fetch events + pickup games whenever the displayed month changes
  useEffect(() => {
    const from = format(subMo(startOfMonth(currentDate), 1), 'yyyy-MM-dd');
    const to = format(addMonths(endOfMonth(currentDate), 1), 'yyyy-MM-dd');

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/events?from=${from}&to=${to}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Event25Live[]>;
      }),
      fetchTimeSlots().catch(() => []),
      fetchFacilities().catch(() => []),
    ])
      .then(([officialEvents, timeSlots, facilities]) => {
        const facilityNameById = new Map(facilities.map((f) => [f.id, f.name]));

        const pickupEvents: Event25Live[] = timeSlots.map((ts) => ({
          id: `pickup-${ts.id}`,
          title: `Pickup ${ts.sport}`,
          facilityId: ts.facilityId,
          facilityName: facilityNameById.get(ts.facilityId) ?? 'Unknown Facility',
          startTime: `${ts.date}T${ts.startTime}:00`,
          endTime: `${ts.date}T${ts.endTime}:00`,
          eventType: 'pickup',
          organization: 'Community pickup game',
          description: `${ts.currentParticipants}/${ts.capacity} participants`,
          status: 'confirmed',
          affectsRecreational: false,
          attendees: ts.currentParticipants,
        }));

        setEvents([...officialEvents, ...pickupEvents]);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const facilities = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.facilityName))).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filterType !== 'all' && event.eventType !== filterType) return false;
      if (filterFacility !== 'all' && event.facilityName !== filterFacility) return false;
      return true;
    });
  }, [events, filterType, filterFacility]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents
      .filter((event) => isSameDay(parseISO(event.startTime), selectedDate))
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
  }, [selectedDate, filteredEvents]);

  const getEventsForDay = (day: Date) =>
    filteredEvents.filter((event) => isSameDay(parseISO(event.startTime), day));

  const getEventTypeGradient = (type: string) => {
    switch (type) {
      case 'game': return 'from-red-500 to-red-600';
      case 'practice': return 'from-blue-500 to-blue-600';
      case 'tournament': return 'from-purple-500 to-purple-600';
      case 'maintenance': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return Trophy;
      case 'practice': return Dumbbell;
      case 'tournament': return Star;
      case 'maintenance': return Wrench;
      default: return Calendar;
    }
  };

  const getEventTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'game': return 'destructive';
      case 'tournament': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Facility Schedule</h1>
        <p className="text-muted-foreground">
          Official athletic events and facility reservations across campus.
        </p>
      </div>

      <Card className="border-warning/50 bg-warning/10">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="p-2 bg-warning rounded-lg">
            <AlertCircle className="size-6 text-warning-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <p className="font-semibold text-lg">
              These events block recreational facility use
            </p>
            <p className="text-foreground/80">
              All events shown are confirmed athletic competitions, team practices, and scheduled maintenance.
              You cannot make recreational reservations during these time blocks.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5" role="alert">
          <CardContent className="p-4 text-sm text-destructive">
            We couldn't load events right now. Check your connection and try refreshing the page.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Filter Events</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Event Type</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'game', 'practice', 'tournament', 'maintenance'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  className="gap-2 capitalize"
                >
                  {type === 'game' && <Trophy className="size-4" />}
                  {type === 'practice' && <Dumbbell className="size-4" />}
                  {type === 'tournament' && <Star className="size-4" />}
                  {type === 'maintenance' && <Wrench className="size-4" />}
                  {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </Button>
              ))}
            </div>
          </div>
          {facilities.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Facility</label>
              <div className="flex flex-wrap gap-2">
                <Button variant={filterFacility === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterFacility('all')}>
                  All Facilities
                </Button>
                {facilities.map((facility) => (
                  <Button key={facility} variant={filterFacility === facility ? 'default' : 'outline'} size="sm" onClick={() => setFilterFacility(facility)}>
                    {facility}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid xl:grid-cols-[1fr,500px] gap-8">
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Calendar className="size-6" />
                {format(currentDate, 'MMMM yyyy')}
                {loading && <span className="text-sm font-normal text-muted-foreground ml-2">Loading…</span>}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentDate((d) => subMonths(d, 1))}>
                  <ChevronLeft className="size-5" />
                </Button>
                <Button variant="outline" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
                  Today
                </Button>
                <Button variant="outline" onClick={() => setCurrentDate((d) => addMonths(d, 1))}>
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-7 gap-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-3 border-b">
                    <span className="hidden md:inline">{day}</span>
                    <span className="md:hidden">{day.slice(0, 3)}</span>
                  </div>
                ))}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square p-2" />
                ))}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  const dayIsPast = isPast(day) && !isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-2 rounded-lg border transition-all
                        ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'hover:bg-muted border-border hover:border-primary/40'}
                        ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                        ${dayIsPast ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="size-full flex flex-col items-center justify-start gap-1.5">
                        <span className={`text-base font-semibold ${isCurrentDay && !isSelected ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex flex-col gap-1 w-full">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div key={i} className={`w-full h-1 rounded-full bg-gradient-to-r ${getEventTypeGradient(event.eventType)}`} title={event.title} />
                            ))}
                            {dayEvents.length > 3 && <span className="text-xs font-medium opacity-70">+{dayEvents.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 pt-6 border-t">
                {[['game', Trophy, 'from-red-500 to-red-600', 'Game'], ['practice', Dumbbell, 'from-blue-500 to-blue-600', 'Practice'], ['tournament', Star, 'from-purple-500 to-purple-600', 'Tournament'], ['maintenance', Wrench, 'from-orange-500 to-orange-600', 'Maintenance']].map(([type, Icon, gradient, label]) => (
                  <div key={type as string} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center size-8 rounded-lg bg-gradient-to-r ${gradient as string}`}>
                      {/* @ts-ignore */}
                      <Icon className="size-4 text-white" />
                    </div>
                    <span className="font-medium">{label as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-xl">
              {selectedDate ? (
                <div className="space-y-1">
                  <div className="text-2xl font-semibold tracking-tight">{format(selectedDate, 'EEEE')}</div>
                  <div className="text-lg text-muted-foreground font-normal">{format(selectedDate, 'MMMM d, yyyy')}</div>
                </div>
              ) : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
            {selectedDate ? (
              <div>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-success/15 mb-4">
                      <Calendar className="size-8 text-success" />
                    </div>
                    <p className="text-lg font-medium mb-2">No Events Scheduled</p>
                    <p className="text-muted-foreground">This day is available for recreational reservations</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {selectedDateEvents.map((event) => {
                      const Icon = getEventTypeIcon(event.eventType);
                      return (
                        <div key={event.id} className="p-6 hover:bg-muted/30 transition-colors">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getEventTypeGradient(event.eventType)} shadow-md`}>
                                  <Icon className="size-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-lg leading-tight mb-1 text-balance">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground font-medium">{event.organization}</p>
                                </div>
                              </div>
                              <Badge variant={getEventTypeBadgeVariant(event.eventType)} className="capitalize">
                                {event.eventType}
                              </Badge>
                            </div>
                            <div className="space-y-2.5 pl-12">
                              <div className="flex items-center gap-3">
                                <Clock className="size-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">
                                  {format(parseISO(event.startTime), 'h:mm a')} – {format(parseISO(event.endTime), 'h:mm a')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({Math.round((parseISO(event.endTime).getTime() - parseISO(event.startTime).getTime()) / 36000) / 100} hrs)
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="size-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">{event.facilityName}</span>
                              </div>
                              {event.attendees && (
                                <div className="flex items-center gap-3">
                                  <Users className="size-4 text-muted-foreground flex-shrink-0" />
                                  <span>{event.attendees} expected attendees</span>
                                </div>
                              )}
                            </div>
                            {event.description && (
                              <div className="pl-12 pt-2 border-t">
                                <p className="text-sm leading-relaxed">{event.description}</p>
                              </div>
                            )}
                            <div className="pl-12">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/15 text-warning rounded-lg">
                                <AlertCircle className="size-4" />
                                <span className="text-sm font-medium">Blocks recreational use</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 px-6">
                <Calendar className="size-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Select a Date</p>
                <p className="text-muted-foreground">Click on any date to view scheduled events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
     </div>
  );
}
