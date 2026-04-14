import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { User, Mail, Phone, Calendar, Trophy, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyReservations } from '../lib/api';
import { useUser } from '../context/UserContext';

export function ProfilePage() {
  const { userName } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    phone: '(555) 123-4567',
  });
  const [reservations, setReservations] = useState<Awaited<ReturnType<typeof fetchMyReservations>>>([]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: userName }));
  }, [userName]);

  useEffect(() => {
    let cancelled = false;
    void fetchMyReservations()
      .then((r) => {
        if (!cancelled) setReservations(r);
      })
      .catch(() => {
        if (!cancelled) setReservations([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const myReservationsCount = reservations.length;

  const { upcoming, completed, facilitiesUsed } = useMemo(() => {
    const now = new Date();
    let up = 0;
    let past = 0;
    const fac = new Set<string>();
    for (const s of reservations) {
      fac.add(s.facilityId);
      const slotDateTime = new Date(`${s.date}T${s.startTime}`);
      if (slotDateTime > now) up += 1;
      else past += 1;
    }
    return { upcoming: up, completed: past, facilitiesUsed: fac.size };
  }, [reservations]);

  const initials = formData.name.split(' ').map((n: string) => n[0]).join('');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center space-y-4">
            <Avatar className="size-24 mx-auto">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{formData.name}</h2>
              <Badge variant="secondary" className="mt-2 capitalize">
                Community Member
              </Badge>
            </div>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span>{formData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span>Member since 2026</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="size-4" />
                <span>{myReservationsCount} Total Sessions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Account Information</CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: userName,
                      email: 'guest@example.com',
                      phone: '(555) 123-4567',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-info">{myReservationsCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Total sessions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-success">{completed}</p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-warning">{upcoming}</p>
              <p className="text-sm text-muted-foreground mt-1">Upcoming</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-primary">{facilitiesUsed}</p>
              <p className="text-sm text-muted-foreground mt-1">Facilities used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
