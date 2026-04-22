import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';
import type { Facility } from '../types';

interface FacilityPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilities: Facility[];
  onPick: (facility: Facility) => void;
}

export function FacilityPickerDialog({
  open,
  onOpenChange,
  facilities,
  onPick,
}: FacilityPickerDialogProps) {
  // Students only for now — campus facilities.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a facility</DialogTitle>
          <DialogDescription>
            Where do you want to play? Pick a court to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          {facilities.map((facility) => (
            <Card
              key={facility.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
              onClick={() => onPick(facility)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{facility.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="size-3" />
                      <span>{facility.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                    {facility.sports.slice(0, 3).map((sport) => (
                      <Badge key={sport} variant="outline" className="text-xs">
                        {sport}
                      </Badge>
                      
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {facilities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No campus facilities available.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}