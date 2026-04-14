import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { MapPin, Navigation, Car, PersonStanding } from 'lucide-react';
import { addDistanceAndETA } from '../utils/distanceCalculator';
import { fetchFacilities } from '../lib/api';
import type { Facility } from '../types';

export function MapViewPage() {
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchFacilities()
      .then((f) => {
        if (!cancelled) setFacilities(f);
      })
      .catch(() => {
        if (!cancelled) setFacilities([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const facilitiesWithDistance = useMemo(() => addDistanceAndETA(facilities), [facilities]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Facility Map</h1>
        <p className="text-muted-foreground mt-2">Find facilities near you</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Location Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Biola University & La Mirada Area
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-primary">{facilitiesWithDistance.length}</div>
                <div className="text-sm text-muted-foreground">Total Facilities</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-primary">
                  {facilitiesWithDistance.filter(f => f.type === 'campus').length}
                </div>
                <div className="text-sm text-muted-foreground">Campus Facilities</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-primary">
                  {facilitiesWithDistance.filter(f => f.type === 'park').length}
                </div>
                <div className="text-sm text-muted-foreground">Public Parks</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30">
              <p className="text-sm text-center text-muted-foreground">
                Interactive map view - Click on facilities below to see details
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">All Facilities</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facilitiesWithDistance.map((facility) => {
            const coords =
              facility.latitude != null && facility.longitude != null
                ? ([facility.latitude, facility.longitude] as [number, number])
                : null;

            return (
              <Card
                key={facility.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedFacility === facility.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedFacility(facility.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{facility.name}</h3>
                    <MapPin className="size-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                  
                  <Badge variant={facility.type === 'campus' ? 'default' : 'secondary'} className="mb-2">
                    {facility.type === 'campus' ? 'Campus' : 'Public Park'}
                  </Badge>
                  
                  <p className="text-sm text-muted-foreground mb-3">{facility.location}</p>
                  
                  {/* Distance and ETA Information */}
                  {(facility.distance !== undefined || facility.drivingETA !== undefined || facility.walkingETA !== undefined) && (
                    <div className="space-y-1.5 mb-3 text-sm">
                      {facility.distance !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Distance:</span>
                          <span className="font-medium">{facility.distance} mi</span>
                        </div>
                      )}
                      {facility.drivingETA !== undefined && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Car className="size-3.5 text-blue-600" />
                            <span className="text-muted-foreground">Driving:</span>
                          </div>
                          <span className="font-medium">{facility.drivingETA} min</span>
                        </div>
                      )}
                      {facility.walkingETA !== undefined && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <PersonStanding className="size-3.5 text-green-600" />
                            <span className="text-muted-foreground">Walking:</span>
                          </div>
                          <span className="font-medium">{facility.walkingETA} min</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {coords && (
                    <p className="text-xs text-muted-foreground mb-3 font-mono">
                      📍 {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {facility.sports.slice(0, 3).map((sport) => (
                      <Badge key={sport} variant="outline" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                    {facility.sports.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{facility.sports.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Link to={`/facility/${facility.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}