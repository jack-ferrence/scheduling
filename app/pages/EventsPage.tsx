import { mock25LiveEvents, mockFacilities } from '../data/mockData';
import { OfficialEventCard } from '../components/OfficialEventCard';
import { OfficialEventDialog } from '../components/OfficialEventDialog';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function EventsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const selectedEvent = mock25LiveEvents.find(e => e.id === selectedEventId);

  const filteredEvents = filter === 'all' 
    ? mock25LiveEvents 
    : mock25LiveEvents.filter(e => e.eventType === filter);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Official Biola Events</h1>
        <p className="text-muted-foreground mt-2">View scheduled 25Live events that affect facility availability</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-full max-w-2xl grid grid-cols-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="athletic">Athletics</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="student_life">Student Life</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const facility = mockFacilities.find(f => f.id === event.facilityId);
              if (!facility) return null;
              return (
                <OfficialEventCard
                  key={event.id}
                  event={event}
                  facility={facility}
                  onClick={() => setSelectedEventId(event.id)}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {selectedEvent && (
        <OfficialEventDialog
          open={selectedEventId !== null}
          onOpenChange={(open) => !open && setSelectedEventId(null)}
          event={selectedEvent}
          facility={mockFacilities.find(f => f.id === selectedEvent.facilityId)!}
        />
      )}
    </div>
  );
}
