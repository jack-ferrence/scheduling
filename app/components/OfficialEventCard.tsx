import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, Users, Building2, AlertCircle } from 'lucide-react';
import { OfficialEvent, Facility } from '../types';
import { format } from 'date-fns';
import { formatTimeRange } from '../utils/timeFormat';

interface OfficialEventCardProps {
  event: OfficialEvent;
  facility: Facility;
  onClick?: () => void;
}

const eventTypeColors = {
  athletic: 'bg-red-100 text-red-900 border-red-300',
  academic: 'bg-blue-100 text-blue-900 border-blue-300',
  student_life: 'bg-purple-100 text-purple-900 border-purple-300',
  performance: 'bg-pink-100 text-pink-900 border-pink-300',
  meeting: 'bg-gray-100 text-gray-900 border-gray-300',
  other: 'bg-orange-100 text-orange-900 border-orange-300',
};

const eventTypeLabels = {
  athletic: 'Athletics',
  academic: 'Academic',
  student_life: 'Student Life',
  performance: 'Performance',
  meeting: 'Meeting',
  other: 'Other',
};

export function OfficialEventCard({ event, facility, onClick }: OfficialEventCardProps) {
  const date = new Date(event.date + 'T00:00:00');

  return (
    <Card
      className="border border-warning/40 bg-warning/5 cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${eventTypeColors[event.eventType]} border`}>
                {eventTypeLabels[event.eventType]}
              </Badge>
              {event.isPublic && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  Public Event
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{event.eventName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{event.organization}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="size-4 text-warning" />
            <span className="font-medium">{facility.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-warning" />
            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-warning" />
            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
          </div>
          {event.attendance && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-warning" />
              <span>Expected Attendance: {event.attendance}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground pt-2 border-t">
            {event.description}
          </p>
        )}

        {event.notes && (
          <div className="flex items-start gap-2 p-2 bg-warning/15 rounded-lg border border-warning/40">
            <AlertCircle className="size-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground/80">{event.notes}</p>
          </div>
        )}

        {event.setupTime && event.teardownTime && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Setup: {formatTimeRange(event.setupTime, event.startTime)}</p>
            <p>Teardown: {formatTimeRange(event.endTime, event.teardownTime)}</p>
          </div>
        )}

        {event.contactName && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="font-medium">Contact: {event.contactName}</p>
            {event.contactEmail && (
              <p className="text-info">{event.contactEmail}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}