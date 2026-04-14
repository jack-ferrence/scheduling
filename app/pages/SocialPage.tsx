import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Heart, MessageCircle, Share2, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { fetchTimeSlots, fetchFacilities } from '../lib/api';
import type { TimeSlot, Facility } from '../types';

interface Activity {
  id: string;
  user: string;
  action: string;
  facility: string;
  sport: string;
  time: Date;
  likes: number;
  comments: number;
}

export function SocialPage() {
  const [newPost, setNewPost] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, f] = await Promise.all([fetchTimeSlots(), fetchFacilities()]);
        if (!cancelled) {
          setSlots(s.slice(0, 10));
          setFacilities(f);
        }
      } catch {
        if (!cancelled) {
          setSlots([]);
          setFacilities([]);
        }
      }
    };
    void load();
  }, []);

  const facilityById = useMemo(() => {
    const m = new Map<string, Facility>();
    facilities.forEach((f) => m.set(f.id, f));
    return m;
  }, [facilities]);

  const activities: Activity[] = slots.map((slot, index) => {
    const facility = facilityById.get(slot.facilityId);
    return {
      id: slot.id,
      user: slot.participants[0]?.name || 'User',
      action: 'joined a session',
      facility: facility?.name || 'Unknown',
      sport: slot.sport,
      time: new Date(Date.now() - index * 3600000),
      likes: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10),
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Social Feed</h1>
        <p className="text-muted-foreground mt-2">Stay connected with the Biola sports community</p>
      </div>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle>Share an Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's happening in your sports activities?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          <Button>Post Update</Button>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    {activity.user.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-semibold">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{activity.sport}</Badge>
                      <span className="text-sm font-medium">{activity.facility}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {format(activity.time, 'MMM d, h:mm a')}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {activity.facility}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="size-3" />
                        Community session
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="size-4" />
                      {activity.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="size-4" />
                      {activity.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="size-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
