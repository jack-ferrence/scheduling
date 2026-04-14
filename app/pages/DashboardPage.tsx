import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { FacilityCard } from '../components/FacilityCard';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Calendar, TrendingUp, Users } from 'lucide-react';
import { mock25LiveEvents } from '../data/mockData';
import { addDistanceAndETA } from '../utils/distanceCalculator';
import { fetchFacilities, fetchStats } from '../lib/api';
import type { Facility } from '../types';

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<'all' | 'campus' | 'park'>('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [activeSlotCount, setActiveSlotCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [f, s] = await Promise.all([fetchFacilities(), fetchStats()]);
        if (!cancelled) {
          setFacilities(f);
          setActiveSlotCount(s.activeSlotCount);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load data');
      }
    };
    void load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

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
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">
            Could not reach the API ({loadError}). Start PostgreSQL, run <code className="rounded bg-muted px-1">npm run db:reset</code>, then{' '}
            <code className="rounded bg-muted px-1">npm run dev</code>.
          </CardContent>
        </Card>
      )}
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome to Biola Sports
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Reserve facilities, join activities, and connect with the Biola community
        </p>
      </div>


      {/* Search */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search facilities, sports, or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Facilities */}
      <div>
        <Tabs value={facilityFilter} onValueChange={(v) => setFacilityFilter(v as any)}>
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="all">All Facilities</TabsTrigger>
            <TabsTrigger value="campus">Campus</TabsTrigger>
            <TabsTrigger value="park">Public Parks</TabsTrigger>
          </TabsList>

          <TabsContent value={facilityFilter} className="mt-8">
            {filteredFacilities.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFacilities.map((facility) => (
                  <Link key={facility.id} to={`/facility/${facility.id}`}>
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

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/reservations" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <Calendar className="size-6 text-primary mb-2" />
              <h3 className="font-semibold">My Reservations</h3>
              <p className="text-sm text-muted-foreground">View and manage your bookings</p>
            </Link>
            <Link to="/events" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <Users className="size-6 text-amber-600 mb-2" />
              <h3 className="font-semibold">Official Events</h3>
              <p className="text-sm text-muted-foreground">See 25Live scheduled events</p>
            </Link>
            <Link to="/map" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <Search className="size-6 text-green-600 mb-2" />
              <h3 className="font-semibold">Map View</h3>
              <p className="text-sm text-muted-foreground">Find facilities near you</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}