import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Clock, MapPin, AlertCircle, ChevronLeft, ChevronRight, Trophy, Dumbbell, Wrench, Star, Users } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, isPast, isFuture, subMonths as subMo } from 'date-fns';

interface Event25Live {
  id: string;
  title: string;
  facilityId: string;
  facilityName: string;
  startTime: string;
  endTime: string;
  eventType: 'practice' | 'game' | 'tournament' | 'maintenance' | 'other';
  organization: string;
  description?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  affectsRecreational: boolean;
  attendees?: number;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'practice' | 'game' | 'tournament' | 'maintenance' | 'other'>('all');
  const [filterFacility, setFilterFacility] = useState<'all' | string>('all');
  const [events, setEvents] = useState<Event25Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events whenever the displayed month changes — load ±1 month for smooth navigation
  useEffect(() => {
    const from = format(subMo(startOfMonth(currentDate), 1), 'yyyy-MM-dd');
    const to = format(addMonths(endOfMonth(currentDate), 1), 'yyyy-MM-dd');

    setLoading(true);
    setError(null);

    fetch(`/api/events?from=${from}&to=${to}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Event25Live[]>;
      })
      .then((data) => {
        setEvents(data);
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
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <Calendar className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">25Live Calendar</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Official Biola University athletic events and facility schedules
            </p>
          </div>
        </div>
      </div>

      <Card className="border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="p-2 bg-orange-500 rounded-lg">
            <AlertCircle className="size-6 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <p className="font-semibold text-lg text-orange-900 dark:text-orange-200">
              These events block recreational facility use
            </p>
            <p className="text-orange-800 dark:text-orange-300">
              All events shown are confirmed athletic competitions, team practices, and scheduled maintenance from the Biola 25Live system.
              You cannot make recreational reservations during these time blocks.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 text-red-700 dark:text-red-300">
            Could not load events: {error}. Run <code>npm run db:sync</code> to fetch data from 25live.
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
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
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
                      className={`aspect-square p-2 rounded-xl border-2 transition-all
                        ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' : 'hover:bg-muted border-border hover:border-primary/50 hover:shadow-md'}
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

        <Card className="shadow-lg xl:sticky xl:top-24 xl:h-fit xl:max-h-[calc(100vh-7rem)]">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-xl">
              {selectedDate ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{format(selectedDate, 'EEEE')}</div>
                  <div className="text-lg text-muted-foreground font-normal">{format(selectedDate, 'MMMM d, yyyy')}</div>
                </div>
              ) : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedDate ? (
              <div className="max-h-[600px] overflow-y-auto">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                      <Calendar className="size-8 text-green-600 dark:text-green-400" />
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
                                  <h4 className="font-bold text-lg leading-tight mb-1">{event.title}</h4>
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
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-300 rounded-lg">
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

      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Star className="size-6" />
            Upcoming Events Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading events…</p>
          ) : filteredEvents.filter((e) => isFuture(parseISO(e.startTime)) || isToday(parseISO(e.startTime))).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming events found. Run <code className="bg-muted px-1 rounded">npm run db:sync</code> to fetch live data from 25live.
            </p>
          ) : (
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredEvents
                .filter((e) => isFuture(parseISO(e.startTime)) || isToday(parseISO(e.startTime)))
                .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
                .slice(0, 20)
                .map((event) => {
                  const Icon = getEventTypeIcon(event.eventType);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-all cursor-pointer group"
                      onClick={() => setSelectedDate(parseISO(event.startTime))}
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getEventTypeGradient(event.eventType)} shadow-md group-hover:shadow-lg transition-shadow`}>
                        <Icon className="size-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">{event.facilityName}</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs capitalize">{event.eventType}</Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">{format(parseISO(event.startTime), 'MMM d')}</p>
                        <p className="text-sm text-muted-foreground">{format(parseISO(event.startTime), 'h:mm a')}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
