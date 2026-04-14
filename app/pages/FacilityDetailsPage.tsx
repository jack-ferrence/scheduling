import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FacilityDetails } from '../components/FacilityDetails';
import { ChatDialog } from '../components/ChatDialog';
import { TimeSlot, Message } from '../types';
import { toast } from 'sonner';
import { useVisibilityPolling } from '../hooks/useVisibilityPolling';

export interface BlockedTime {
  booking_id: string;
  event_name: string;
  organization: string | null;
  date: string;       // YYYY-MM-DD
  start_local: string; // HH:MM
  end_local: string;
  event_type: string;
  is_public: boolean;
}
import { addDistanceAndETA } from '../utils/distanceCalculator';
import {
  fetchFacility,
  fetchTimeSlots,
  createTimeSlot,
  joinTimeSlot,
  ApiError,
} from '../lib/api';
import { useUser } from '../context/UserContext';
import type { Facility } from '../types';

export function FacilityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, userName, loading: userLoading } = useUser();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTimeSlotId, setChatTimeSlotId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const from = new Date().toISOString();
      const to = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const [f, slots, blocked] = await Promise.all([
        fetchFacility(id),
        fetchTimeSlots({ facilityId: id }),
        fetch(`/api/facilities/${id}/blocked-times?from=${from}&to=${to}`)
          .then((r) => r.ok ? r.json() as Promise<BlockedTime[]> : []),
      ]);
      setFacility(f);
      setTimeSlots(slots);
      setBlockedTimes(blocked);
      setPageError(null);
    } catch (e) {
      setPageError(e instanceof Error ? e.message : 'Failed to load facility');
    }
  }, [id]);

  useVisibilityPolling(load, 5000);

  const facilitiesWithDistance = useMemo(
    () => (facility ? addDistanceAndETA([facility]) : []),
    [facility]
  );
  const facilityWithDistance = facilitiesWithDistance[0];

  const facilityTimeSlots = timeSlots.filter((ts) => ts.facilityId === id);
  const selectedChatTimeSlot = timeSlots.find((ts) => ts.id === chatTimeSlotId);
  const chatMessages = messages.filter((m) => m.timeSlotId === chatTimeSlotId);

  if (pageError && !facility) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Could not load facility</h1>
        <p className="text-muted-foreground mt-2">{pageError}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
          Go back to dashboard
        </button>
      </div>
    );
  }

  if (!facilityWithDistance) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        {userLoading ? 'Loading…' : 'Loading facility…'}
      </div>
    );
  }

  const effectiveUserId = userId ?? 'pending';

  const handleJoinTimeSlot = async (timeSlotId: string) => {
    if (!userId) {
      toast.error('Still setting up your session — try again in a moment.');
      return;
    }
    try {
      await joinTimeSlot(timeSlotId);
      toast.success('Successfully joined the session!');
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not join';
      toast.error(msg);
    }
  };

  const handleViewChat = (timeSlotId: string) => {
    setChatTimeSlotId(timeSlotId);
  };

  const handleSendMessage = (message: string) => {
    if (!chatTimeSlotId || !userId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      timeSlotId: chatTimeSlotId,
      userId,
      userName,
      message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleCreateReservation = async (data: {
    name: string;
    email: string;
    phone: string;
    sport: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) => {
    if (!userId || !id) {
      toast.error('Still setting up your session — try again in a moment.');
      return;
    }
    try {
      await createTimeSlot(id, {
        sport: data.sport,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
      });
      toast.success('Reservation created successfully!');
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not create reservation';
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FacilityDetails
        facility={facilityWithDistance}
        timeSlots={facilityTimeSlots}
        blockedTimes={blockedTimes}
        onBack={() => navigate('/')}
        onJoinTimeSlot={handleJoinTimeSlot}
        onViewChat={handleViewChat}
        onCreateReservation={handleCreateReservation}
        currentUserId={effectiveUserId}
      />

      {selectedChatTimeSlot && (
        <ChatDialog
          open={chatTimeSlotId !== null}
          onOpenChange={(open) => !open && setChatTimeSlotId(null)}
          timeSlot={selectedChatTimeSlot}
          messages={chatMessages}
          currentUserId={effectiveUserId}
          currentUserName={userName}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
