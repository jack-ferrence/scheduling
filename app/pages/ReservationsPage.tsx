import { useState, useMemo, useCallback } from 'react';
import { TimeSlot } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { formatTimeRange } from '../utils/timeFormat';
import { format } from 'date-fns';
import { fetchMyReservations, fetchFacilities, leaveTimeSlot, ApiError } from '../lib/api';
import { toast } from 'sonner';
import { useVisibilityPolling } from '../hooks/useVisibilityPolling';
import type { Facility } from '../types';
import { MessageCircle } from 'lucide-react';
import { ChatDialog } from '../components/ChatDialog';
import { useUser } from '../context/UserContext';
import type { Message } from '../types';



export function ReservationsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { userId, userName } = useUser();
  const [chatSlotId, setChatSlotId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const chatSlot = useMemo(
    () => timeSlots.find((s) => s.id === chatSlotId) ?? null,
    [timeSlots, chatSlotId]
  );
  const chatMessages = useMemo(
    () => messages.filter((m) => m.timeSlotId === chatSlotId),
    [messages, chatSlotId]
  );

  const handleSendMessage = (msg: string) => {
    if (!chatSlotId || !userId) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        timeSlotId: chatSlotId,
        userId,
        userName,
        message: msg,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const load = useCallback(async () => {
    try {
      const [slots, facs] = await Promise.all([fetchMyReservations(), fetchFacilities()]);
      setTimeSlots(slots);
      setFacilities(facs);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);
  const handleCancel = useCallback(async (slotId: string) => {
    try {
      await leaveTimeSlot(slotId);
      toast.success('Cancelled — you left the session.');
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not cancel';
      toast.error(msg);
    }
  }, [load]);


  useVisibilityPolling(load, 6000);

  const facilityById = useMemo(() => {
    const m = new Map<string, Facility>();
    facilities.forEach((f) => m.set(f.id, f));
    return m;
  }, [facilities]);

  const myReservations = useMemo(() => {
    return [...timeSlots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [timeSlots]);

  const upcomingReservations = myReservations.filter((slot) => {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);
    return slotDateTime > new Date();
  });

  const pastReservations = myReservations.filter((slot) => {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);
    return slotDateTime <= new Date();
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground mt-2">Manage your upcoming and past sessions</p>
      </div>

      {loadError && (
        <p className="text-sm text-destructive" role="alert">
          We couldn't load your reservations. Check your connection and try refreshing the page.
        </p>
      )}

      {/* Upcoming */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
        {upcomingReservations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingReservations.map((slot) => {
              const facility = facilityById.get(slot.facilityId);
              if (!facility) return null;

              const isFull = slot.currentParticipants >= slot.capacity;
              const date = new Date(slot.date + 'T00:00:00');

              return (
                <Card key={slot.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{slot.sport}</CardTitle>
                        <p className="text-sm text-muted-foreground">{facility.name}</p>
                      </div>
                      {isFull && <Badge variant="secondary">Full</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-primary" />
                      <span>{format(date, 'EEEE, MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-primary" />
                      <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="size-4 text-primary" />
                      <span className="tabular-nums">
                        {slot.currentParticipants}/{slot.capacity} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-primary" />
                      <span className="text-xs">{facility.location}</span>
                    </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => setChatSlotId(slot.id)}
                          className="flex-1 bg-black text-white hover:bg-black/90"
                        >
                          <MessageCircle className="size-4 mr-2" />
                          View Chat
                        </Button>
                        <Link to={`/facility/${facility.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(slot.id)}
                        >
                          Cancel
                        </Button>
                      </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming reservations</h3>
              <p className="text-muted-foreground mb-4">
                Pick a facility to reserve a court, field, or pickup game.
              </p>
              <Link to="/">
                <Button>Browse facilities</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past */}
      {pastReservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Past Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastReservations.map((slot) => {
              const facility = facilityById.get(slot.facilityId);
              if (!facility) return null;

              const date = new Date(slot.date + 'T00:00:00');

              return (
                <Card key={slot.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="text-lg">{slot.sport}</CardTitle>
                    <p className="text-sm text-muted-foreground">{facility.name}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span>{format(date, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {chatSlot && (
        <ChatDialog
          open={chatSlotId !== null}
          onOpenChange={(open) => !open && setChatSlotId(null)}
          timeSlot={chatSlot}
          messages={chatMessages}
          currentUserId={userId ?? 'pending'}
          currentUserName={userName}
          onSendMessage={handleSendMessage}
        />
      )}

    </div>
  );
}
