import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Facility, TimeSlot } from '../types';
import { TimeSlotCard } from './TimeSlotCard';
import { CreateReservationDialog } from './CreateReservationDialog';
import { formatTo12Hour } from '../utils/timeFormat';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
export interface BlockedTime {
  booking_id: string;
  event_name: string;
  organization: string | null;
  date: string;
  start_local: string;
  end_local: string;
  event_type: string;
  is_public: boolean;
  /** Sport category when the block came from a user pickup game */
  sport?: string;
}
type BlockStyle = {
  icon: LucideIcon; bg: string; border: string; iconBg: string; iconText: string; label: string;
};

const SPORT_STYLES: Record<string, BlockStyle> = {
  basketball:      { icon: Dribbble,    bg: 'bg-orange-50',  border: 'border-orange-200',  iconBg: 'bg-orange-100',  iconText: 'text-orange-600',  label: 'text-orange-700' },
  volleyball:      { icon: Volleyball,  bg: 'bg-amber-50',   border: 'border-amber-200',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   label: 'text-amber-700' },
  tennis:          { icon: Target,      bg: 'bg-lime-50',    border: 'border-lime-200',    iconBg: 'bg-lime-100',    iconText: 'text-lime-600',    label: 'text-lime-700' },
  soccer:          { icon: Goal,        bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', label: 'text-emerald-700' },
  swimming:        { icon: Waves,       bg: 'bg-cyan-50',    border: 'border-cyan-200',    iconBg: 'bg-cyan-100',    iconText: 'text-cyan-600',    label: 'text-cyan-700' },
  badminton:       { icon: Feather,     bg: 'bg-purple-50',  border: 'border-purple-200',  iconBg: 'bg-purple-100',  iconText: 'text-purple-600',  label: 'text-purple-700' },
  pickleball:      { icon: Target,      bg: 'bg-teal-50',    border: 'border-teal-200',    iconBg: 'bg-teal-100',    iconText: 'text-teal-600',    label: 'text-teal-700' },
  racquetball:     { icon: Target,      bg: 'bg-pink-50',    border: 'border-pink-200',    iconBg: 'bg-pink-100',    iconText: 'text-pink-600',    label: 'text-pink-700' },
  'track & field': { icon: Footprints,  bg: 'bg-yellow-50',  border: 'border-yellow-200',  iconBg: 'bg-yellow-100',  iconText: 'text-yellow-600',  label: 'text-yellow-700' },
  baseball:        { icon: Circle,      bg: 'bg-rose-50',    border: 'border-rose-200',    iconBg: 'bg-rose-100',    iconText: 'text-rose-600',    label: 'text-rose-700' },
  fitness:         { icon: Dumbbell,    bg: 'bg-indigo-50',  border: 'border-indigo-200',  iconBg: 'bg-indigo-100',  iconText: 'text-indigo-600',  label: 'text-indigo-700' },
};

const EVENT_STYLES: Record<string, BlockStyle> = {
  academic:    { icon: GraduationCap, bg: 'bg-blue-50',    border: 'border-blue-200',    iconBg: 'bg-blue-100',    iconText: 'text-blue-600',    label: 'text-blue-700' },
  performance: { icon: Music,         bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-600', label: 'text-fuchsia-700' },
  meeting:     { icon: Users,         bg: 'bg-slate-50',   border: 'border-slate-200',   iconBg: 'bg-slate-100',   iconText: 'text-slate-600',   label: 'text-slate-700' },
  pickup:      { icon: Users,         bg: 'bg-violet-50',  border: 'border-violet-200',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  label: 'text-violet-700' },
  default:     { icon: CalendarDays,  bg: 'bg-slate-50',   border: 'border-slate-200',   iconBg: 'bg-slate-100',   iconText: 'text-slate-600',   label: 'text-slate-700' },
};

function getBlockStyle(b: BlockedTime): BlockStyle {
  if (b.sport) {
    const s = SPORT_STYLES[b.sport.toLowerCase()];
    if (s) return s;
  }
  const haystack = `${b.event_name ?? ''} ${b.event_type ?? ''}`.toLowerCase();
  for (const [key, style] of Object.entries(SPORT_STYLES)) {
    if (haystack.includes(key)) return style;
  }
  const et = (b.event_type ?? '').toLowerCase();
  if (et === 'pickup') return EVENT_STYLES.pickup;
  if (et.includes('academic') || haystack.includes('class') || haystack.includes('lecture')) return EVENT_STYLES.academic;
  if (et.includes('performance') || haystack.includes('concert') || haystack.includes('recital')) return EVENT_STYLES.performance;
  if (et.includes('meeting')) return EVENT_STYLES.meeting;
  return EVENT_STYLES.default;
}

import {
  ArrowLeft, MapPin, Plus, Clock, Car, Info, Accessibility, Navigation, PersonStanding,
  CheckCircle, CalendarDays,
  Dribbble, Volleyball, Target, Goal, Waves, Feather, Footprints, Circle, Dumbbell,
  Users, GraduationCap, Music,
  type LucideIcon,
} from 'lucide-react';

/** Convert user-created pickup games into BlockedTime entries so they show in Availability. */
function pickupGamesToBlocked(slots: TimeSlot[]): BlockedTime[] {
  return slots.map((s) => ({
    booking_id: `pickup-${s.id}`,
    event_name: `${s.sport} pickup game`,
    organization: null,
    date: s.date,
    start_local: s.startTime,
    end_local: s.endTime,
    event_type: 'pickup',
    is_public: true,
    sport: s.sport,
  }));
}


interface FacilityDetailsProps {
  facility: Facility;
  timeSlots: TimeSlot[];
  blockedTimes: BlockedTime[];
  onBack: () => void;
  onJoinTimeSlot: (timeSlotId: string) => void | Promise<void>;
  onLeaveTimeSlot: (timeSlotId: string) => void | Promise<void>;
  onViewChat: (timeSlotId: string) => void;
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
  currentUserId: string;
}

export function FacilityDetails({
  facility,
  timeSlots,
  blockedTimes,
  onBack,
  onJoinTimeSlot,
  onLeaveTimeSlot,
  onViewChat,
  onCreateReservation,
  currentUserId,
}: FacilityDetailsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('availability');
  const [selectedDay, setSelectedDay] = useState(0); // days from today

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);

  const dayBlocked = useMemo(() => {
    const target = days[selectedDay];
    return blockedTimes.filter((b) => isSameDay(parseISO(b.date), target));
  }, [blockedTimes, days, selectedDay]);

  const now = new Date();
  const upcomingSlots = timeSlots.filter(slot => {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);
    return slotDateTime > now;
  });

  const pastSlots = timeSlots.filter(slot => {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);
    return slotDateTime <= now;
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="size-4 mr-2" />
        Back to Facilities
      </Button>

      <div className="relative">
        <img
          src={facility.image}
          alt={facility.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <Badge 
          variant={facility.type === 'campus' ? 'default' : 'secondary'}
          className="absolute top-4 right-4"
        >
          {facility.type === 'campus' ? 'Campus Facility' : 'Public Park'}
        </Badge>
      </div>

      <div>
        <h1 className="mb-2">{facility.name}</h1>
        <div className="flex items-start gap-2 text-muted-foreground mb-4">
          <MapPin className="size-5 mt-0.5 flex-shrink-0" />
          <span>{facility.location}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {facility.sports.map((sport) => (
            <Badge key={sport} variant="outline">
              {sport}
            </Badge>
          ))}
        </div>
      </div>

      {/* Facility Information Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Distance and ETA Card */}
        {(facility.distance !== undefined || facility.drivingETA !== undefined || facility.walkingETA !== undefined) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Navigation className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-3">Distance & ETA</h3>
                  <div className="space-y-2 text-sm">
                    {facility.distance !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Distance:</span>
                        <span className="font-medium">{facility.distance} miles</span>
                      </div>
                    )}
                    {facility.drivingETA !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Car className="size-4 text-info" />
                          <span className="text-muted-foreground">Driving:</span>
                        </div>
                        <span className="font-medium">{facility.drivingETA} min</span>
                      </div>
                    )}
                    {facility.walkingETA !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PersonStanding className="size-4 text-success" />
                          <span className="text-muted-foreground">Walking:</span>
                        </div>
                        <span className="font-medium">{facility.walkingETA} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground">{facility.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Hours</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opens:</span>
                    <span className="font-medium">{formatTo12Hour(facility.openingTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closes:</span>
                    <span className="font-medium">{formatTo12Hour(facility.closingTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Car className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Parking</h3>
                <p className="text-sm text-muted-foreground">
                  {facility.parkingAvailable ? 'Free parking available on-site' : 'Limited street parking'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Accessibility className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">{facility.accessibility}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-1.5">
              {facility.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2>Schedule & Reservations</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Post Pickup Game
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="availability">
            <CalendarDays className="size-4 mr-1.5" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Pickup Games ({upcomingSlots.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastSlots.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Availability (25live) ── */}
        <TabsContent value="availability" className="mt-6 space-y-4">
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-lg border transition-all ${
                  selectedDay === i
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary/40 hover:bg-muted'
                }`}
              >
                <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                <span className="text-lg font-semibold tabular-nums">{format(day, 'd')}</span>
                <span className="text-xs">{format(day, 'MMM')}</span>
              </button>
            ))}
          </div>

          {/* Blocked events for selected day */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="size-4" />
                {format(days[selectedDay], 'EEEE, MMMM d')}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  — Hours: {formatTo12Hour(facility.openingTime)} – {formatTo12Hour(facility.closingTime)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayBlocked.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle className="size-5 text-success flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-success">Fully available</p>
                    <p className="text-sm text-success/90">
                      No official events scheduled — open all day for recreational use.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {dayBlocked.length} event{dayBlocked.length > 1 ? 's' : ''} blocking this facility:
                  </p>
                  {dayBlocked
                    .sort((a, b) => a.start_local.localeCompare(b.start_local))
                    .map((b) => {
                      const style = getBlockStyle(b);
                      const Icon = style.icon;
                      return (
                        <div
                          key={b.booking_id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}
                        >
                          <div className={`size-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
                            <Icon className={`size-5 ${style.iconText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${style.label}`}>{b.event_name}</p>
                            {b.organization && <p className="text-xs text-muted-foreground">{b.organization}</p>}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Clock className="size-3 text-muted-foreground" />
                              <span className="text-xs font-medium">
                                {formatTo12Hour(b.start_local)} – {formatTo12Hour(b.end_local)}
                              </span>
                              <Badge variant="outline" className="text-xs capitalize">{b.sport ?? b.event_type}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Upcoming pickup games ── */}
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingSlots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pickup games posted yet. Be the first!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSlots.map((slot) => {
                const isParticipant = slot.participants.some((p) => p.id === currentUserId);
                return (
                  <TimeSlotCard
                    key={slot.id}
                    timeSlot={slot}
                    facility={facility}
                    onJoin={() => onJoinTimeSlot(slot.id)}
                    onViewChat={() => onViewChat(slot.id)}
                    onCancel={isParticipant ? () => onLeaveTimeSlot(slot.id) : undefined}
                    isParticipant={isParticipant}
                    currentUserId={currentUserId}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Past ── */}
        <TabsContent value="past" className="space-y-4 mt-6">
          {pastSlots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No past games.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastSlots.map((slot) => {
                const isParticipant = slot.participants.some((p) => p.id === currentUserId);
                return (
                  <TimeSlotCard
                    key={slot.id}
                    timeSlot={slot}
                    facility={facility}
                    onJoin={() => onJoinTimeSlot(slot.id)}
                    onViewChat={() => onViewChat(slot.id)}
                    isParticipant={isParticipant}
                    currentUserId={currentUserId}
                    isPast
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        facility={facility}
        blockedTimes={blockedTimes}
        onCreateReservation={onCreateReservation}
      />
    </div>
  );
}