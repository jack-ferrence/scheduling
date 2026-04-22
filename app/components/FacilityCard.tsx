import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Clock, Navigation, Car, PersonStanding } from 'lucide-react';
import { Facility } from '../types';
import { formatTimeRange } from '../utils/timeFormat';

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group border hover:border-primary/40 h-full">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={facility.image}
          alt=""
          loading="lazy"
          decoding="async"
          width="800"
          height="384"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge
          variant={facility.type === 'campus' ? 'default' : 'secondary'}
          className="absolute top-3 right-3 shadow-sm"
        >
          {facility.type === 'campus' ? 'Campus' : 'Public Park'}
        </Badge>
        {facility.distance !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge variant="secondary" className="shadow-sm bg-foreground/70 text-background border-none backdrop-blur-sm tabular-nums">
              <Navigation className="size-3 mr-1" />
              {facility.distance} mi
            </Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="group-hover:text-primary transition-colors">{facility.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="size-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>{facility.location}</span>
        </div>
        
        {/* Distance and ETA Information */}
        {(facility.drivingETA !== undefined || facility.walkingETA !== undefined) && (
          <div className="flex gap-3 mb-3 text-xs tabular-nums">
            {facility.drivingETA !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Car className="size-3.5 text-info" />
                <span>{facility.drivingETA} min</span>
              </div>
            )}
            {facility.walkingETA !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <PersonStanding className="size-3.5 text-success" />
                <span>{facility.walkingETA} min</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1.5">
          {facility.sports.map((sport) => (
            <Badge key={sport} variant="outline" className="text-xs">
              {sport}
            </Badge>
          ))}
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
          <Clock className="size-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>{formatTimeRange(facility.openingTime, facility.closingTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
}