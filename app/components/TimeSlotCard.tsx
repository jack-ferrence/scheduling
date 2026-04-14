import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, Users, MessageCircle } from 'lucide-react';
import { TimeSlot, Facility } from '../types';
import { format } from 'date-fns';
import { formatTimeRange } from '../utils/timeFormat';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  facility: Facility;
  onJoin: () => void;
  onViewChat: () => void;
  isParticipant: boolean;
  currentUserId: string;
}

export function TimeSlotCard({ 
  timeSlot, 
  facility, 
  onJoin, 
  onViewChat, 
  isParticipant,
  currentUserId 
}: TimeSlotCardProps) {
  const isFull = timeSlot.currentParticipants >= timeSlot.capacity;
  const availableSpots = timeSlot.capacity - timeSlot.currentParticipants;
  const date = new Date(timeSlot.date + 'T00:00:00');

  return (
    <Card className="hover:shadow-md transition-all duration-300 border hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{timeSlot.sport}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{facility.name}</p>
          </div>
          <Badge 
            variant={isFull ? 'destructive' : 'default'}
            className="ml-2 shrink-0"
          >
            {isFull ? 'Full' : `${availableSpots} spot${availableSpots !== 1 ? 's' : ''}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-primary" />
            <span className="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-primary" />
            <span className="font-medium">{formatTimeRange(timeSlot.startTime, timeSlot.endTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="size-4 text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{timeSlot.currentParticipants} / {timeSlot.capacity} participants</span>
              </div>
              <div className="mt-1.5 w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all ${isFull ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${(timeSlot.currentParticipants / timeSlot.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isParticipant ? (
            <Button onClick={onViewChat} className="flex-1 shadow-sm hover:shadow-md transition-shadow">
              <MessageCircle className="size-4 mr-2" />
              View Chat
            </Button>
          ) : (
            <Button 
              onClick={onJoin} 
              disabled={isFull}
              className="flex-1 shadow-sm hover:shadow-md transition-shadow"
            >
              {isFull ? 'Session Full' : 'Join Session'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}