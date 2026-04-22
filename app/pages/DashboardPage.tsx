import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { FacilityCard } from '../components/FacilityCard';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Search } from 'lucide-react';
import { addDistanceAndETA } from '../utils/distanceCalculator';
import { fetchFacilities } from '../lib/api';
import { useVisibilityPolling } from '../hooks/useVisibilityPolling';
import type { Facility } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../components/ui/button';
import { Navigation } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RED_ICON = L.divIcon({
  className: 'sport-red-pin',
  html: `
    <div style="position: relative; width: 32px; height: 44px;">
      <div style="
        position: absolute; top: 0; left: 0;
        width: 32px; height: 32px;
        background: #dc2626;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(220, 38, 38, 0.5), 0 0 0 2px rgba(220, 38, 38, 0.3);
      "></div>
      <div style="
        position: absolute; top: 9px; left: 10px;
        width: 12px; height: 12px;
        background: #ffffff;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
});

const CAMPUS_CENTER: [number, number] = [33.90649846017476, -118.01549380221009];
const DEFAULT_ZOOM = 17;



function ResetViewButton() {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(CAMPUS_CENTER, DEFAULT_ZOOM)}
      className="absolute top-3 right-3 z-[1000] bg-white hover:bg-muted
                 px-3 py-2 rounded-md shadow-md text-sm font-medium
                 border flex items-center gap-1.5"
    >
      <Navigation className="size-4" />
      Reset View
    </button>
  );
}


type FacilityFilter = 'all' | 'campus' | 'park';

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<FacilityFilter>('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const f = await fetchFacilities();
      setFacilities(f);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load data');
    }
  }, []);

  useVisibilityPolling(load, 8000);

  const facilitiesWithDistance = useMemo(() => addDistanceAndETA(facilities), [facilities]);

  const filteredFacilities = useMemo(() => {
    return facilitiesWithDistance.filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.sports.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = facilityFilter === 'all' || facility.type === facilityFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, facilityFilter, facilitiesWithDistance]);


  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {loadError && (
        <Card className="border-destructive/50 bg-destructive/5" role="alert">
          <CardContent className="pt-6 text-sm text-destructive">
            We couldn't load facilities right now. Check your connection and try refreshing the page.
            If the problem persists, contact Campus Recreation.
          </CardContent>
        </Card>
      )}
      {/* Hero */}
      <div className="space-y-3 pt-4">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground max-w-[14ch]">
          Find a court. Book it.
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground max-w-[55ch]">
          Reserve facilities and join pickup games across campus.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search facilities, sports, or locations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Facilities */}
      <div>
        <Tabs value={facilityFilter} onValueChange={(v) => setFacilityFilter(v as FacilityFilter)}>
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="all">All Facilities</TabsTrigger>
            <TabsTrigger value="campus">Campus</TabsTrigger>
            <TabsTrigger value="park">Public Parks</TabsTrigger>
          </TabsList>

          <TabsContent value={facilityFilter} className="mt-8">
            {filteredFacilities.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFacilities.map((facility) => (
                  <Link
                    key={facility.id}
                    to={`/facility/${facility.id}`}
                    aria-label={`View details for ${facility.name}`}
                    className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <FacilityCard facility={facility} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No facilities found matching your search.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Campus Map */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Local Map</h2>
        <div className="relative rounded-lg overflow-hidden border" style={{ height: '500px' }}>
          <MapContainer
            center={CAMPUS_CENTER}
            zoom={DEFAULT_ZOOM}
            
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ResetViewButton />
            {filteredFacilities
              .filter(f => f.latitude != null && f.longitude != null)
              .map((facility) => (
                <Marker
                  key={facility.id}
                  position={[facility.latitude!, facility.longitude!]}
                  icon={RED_ICON}

                >
                  <Popup maxWidth={360} minWidth={340}>
                    <Link to={`/facility/${facility.id}`}>
                      <FacilityCard facility={facility} />
                    </Link>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>


    </div>
  );
}