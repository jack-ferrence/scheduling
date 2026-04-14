import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, MapPin, Plus, Clock, Car, Info, Accessibility, Navigation, PersonStanding, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { Facility, TimeSlot } from '../types';
import { TimeSlotCard } from './TimeSlotCard';
import { CreateReservationDialog } from './CreateReservationDialog';
import { formatTo12Hour } from '../utils/timeFormat';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import type { BlockedTime } from '../pages/FacilityDetailsPage';

interface FacilityDetailsProps {
  facility: Facility;
  timeSlots: TimeSlot[];
  blockedTimes: BlockedTime[];
  onBack: () => void;
  onJoinTimeSlot: (timeSlotId: string) => void | Promise<void>;
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
                    .map((b) => (
                      <div key={b.booking_id} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <XCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{b.event_name}</p>
                          {b.organization && (
                            <p className="text-xs text-muted-foreground">{b.organization}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="size-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {formatTo12Hour(b.start_local)} – {formatTo12Hour(b.end_local)}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">{b.event_type}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
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