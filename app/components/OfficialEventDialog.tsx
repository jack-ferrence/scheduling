import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { OfficialEvent, Facility } from '../types';
import { Calendar, Clock, Users, Building2, Mail, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { formatTimeRange } from '../utils/timeFormat';

interface OfficialEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: OfficialEvent;
  facility: Facility;
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

export function OfficialEventDialog({ open, onOpenChange, event, facility }: OfficialEventDialogProps) {
  const date = new Date(event.date + 'T00:00:00');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${eventTypeColors[event.eventType]} border`}>
              {eventTypeLabels[event.eventType]}
            </Badge>
            {event.isPublic && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Open to Public
              </Badge>
            )}
          </div>
          <DialogTitle className="text-2xl">{event.eventName}</DialogTitle>
          <DialogDescription className="text-base">
            {event.organization}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Location */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Building2 className="size-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">{facility.name}</div>
              <div className="text-sm text-muted-foreground">{facility.location}</div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="size-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-semibold">{format(date, 'EEEE')}</div>
                <div>{format(date, 'MMMM d, yyyy')}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="size-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Time</div>
                <div className="font-semibold">{formatTimeRange(event.startTime, event.endTime)}</div>
              </div>
            </div>
          </div>

          {/* Setup and Teardown Times */}
          {event.setupTime && event.teardownTime && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-4 text-amber-700" />
                <span className="font-semibold text-sm text-amber-900">Facility Reserved</span>
              </div>
              <div className="text-sm text-amber-800 space-y-1">
                <p>Setup begins: {formatTimeRange(event.setupTime, event.startTime)}</p>
                <p>Event ends: {formatTimeRange(event.endTime, event.teardownTime)}</p>
                <p className="font-medium mt-2">Recreational use not available during this time</p>
              </div>
            </div>
          )}

          {/* Attendance */}
          {event.attendance && (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Users className="size-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Expected Attendance</div>
                <div className="font-semibold text-lg">{event.attendance.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Description</div>
              <p>{event.description}</p>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-blue-700 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-blue-900 mb-1">Important Note</div>
                  <p className="text-sm text-blue-800">{event.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {event.contactName && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Event Contact</div>
              <div className="flex items-center gap-2 mb-1">
                <User className="size-4 text-primary" />
                <span className="font-semibold">{event.contactName}</span>
              </div>
              {event.contactEmail && (
                <div className="flex items-center gap-2 ml-6">
                  <Mail className="size-4 text-primary" />
                  <a href={`mailto:${event.contactEmail}`} className="text-blue-600 hover:underline">
                    {event.contactEmail}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
