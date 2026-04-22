import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TimeSlotCard } from '../components/TimeSlotCard';
import { CreateReservationDialog } from '../components/CreateReservationDialog';
import { FacilityPickerDialog } from '../components/FacilityPickerDialog';
import type { BlockedTime } from './FacilityDetailsPage';
import {
  fetchTimeSlots,
  fetchFacilities,
  createTimeSlot,
  joinTimeSlot,
  ApiError,
} from '../lib/api';
import { useUser } from '../context/UserContext';
import { useVisibilityPolling } from '../hooks/useVisibilityPolling';
import type { TimeSlot, Facility } from '../types';
import { useNavigate } from 'react-router';


export function SocialPage() {
  const navigate = useNavigate();
  const { userId, userName, loading: userLoading } = useUser();

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Two-step flow state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);

  const load = useCallback(async () => {
    try {
      const from = new Date().toISOString();
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const [s, f] = await Promise.all([
        fetchTimeSlots({ from, to }),
        fetchFacilities(),
      ]);
      setSlots(s);
      setFacilities(f);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load games');
    }
  }, []);

  useVisibilityPolling(load, 8000);

  const facilityById = useMemo(() => {
    const m = new Map<string, Facility>();
    facilities.forEach((f) => m.set(f.id, f));
    return m;
  }, [facilities]);

  // Only show games at campus facilities (students-only scope)
  const visibleSlots = useMemo(
    () =>
      slots.filter((s) => {
        const fac = facilityById.get(s.facilityId);
        return fac?.type === 'campus';
      }),
    [slots, facilityById]
  );

  // ---- Two-step create flow ----
  const handlePickFacility = async (facility: Facility) => {
    setPickerOpen(false);
    setSelectedFacility(facility);

    // Fetch blocked times for this facility before opening the create dialog
    try {
      const from = new Date().toISOString();
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const r = await fetch(
        `/api/facilities/${facility.id}/blocked-times?from=${from}&to=${to}`
      );
      const blocked: BlockedTime[] = r.ok ? await r.json() : [];
      setBlockedTimes(blocked);
    } catch {
      setBlockedTimes([]);
    }

    setCreateOpen(true);
  };

  const handleCreateGame = async (data: {
    name: string;
    email: string;
    phone: string;
    sport: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) => {
    if (!userId || !selectedFacility) {
      toast.error('Still setting up your session — try again in a moment.');
      return;
    }
    try {
      await createTimeSlot(selectedFacility.id, {
        sport: data.sport,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
      });
      toast.success('Game posted!');
      setSelectedFacility(null);
      setBlockedTimes([]);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not post game';
      toast.error(msg);
    }
  };

  // ---- Join ----
  const handleJoin = async (slotId: string) => {
    if (!userId) {
      toast.error('Still setting up your session — try again in a moment.');
      return;
    }
    try {
      await joinTimeSlot(slotId);
      toast.success('You joined the game!');
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not join';
      toast.error(msg);
    }
  };

  const effectiveUserId = userId ?? 'pending';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Game Board</h1>
          <p className="text-muted-foreground mt-2">
            See who's playing. Post your own game. Join the fun.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setPickerOpen(true)}
          disabled={userLoading}
        >
          <Plus className="size-4 mr-2" />
          Post a Game
        </Button>
      </div>

      {loadError && (
        <Card className="border-destructive/50 bg-destructive/5" role="alert">
          <CardContent className="pt-6 text-sm text-destructive">
            We couldn't load games right now. Check your connection and refresh.
          </CardContent>
        </Card>
      )}

      {/* Game feed */}
      {visibleSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-2">No games posted yet.</p>
            <p className="text-sm">Be the first — click "Post a Game" above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleSlots.map((slot) => {
            const facility = facilityById.get(slot.facilityId);
            if (!facility) return null;
            const isParticipant = slot.participants.some(
              (p) => p.id === effectiveUserId
            );
            return (
              <TimeSlotCard
                key={slot.id}
                timeSlot={slot}
                facility={facility}
                onJoin={() => handleJoin(slot.id)}
                onViewChat={() => navigate(`/facility/${slot.facilityId}`)}
                isParticipant={isParticipant}
                currentUserId={effectiveUserId}
              />
            );
          })}
        </div>
      )}

      {/* Step 1 of create flow */}
      <FacilityPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        facilities={facilities}
        onPick={handlePickFacility}
      />

      {/* Step 2 of create flow */}
      {selectedFacility && (
        <CreateReservationDialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setSelectedFacility(null);
              setBlockedTimes([]);
            }
          }}
          facility={selectedFacility}
          blockedTimes={blockedTimes}
          onCreateReservation={handleCreateGame}
        />
      )}
    </div>
  );
}