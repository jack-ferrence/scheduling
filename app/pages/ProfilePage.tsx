import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Edit } from 'lucide-react';
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
            <CardContent className="pt-8 pb-8 text-center space-y-5">
              <Avatar className="size-40 mx-auto">
                <AvatarFallback className="text-5xl bg-primary text-primary-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{formData.name}</h2>
                <Badge variant="secondary" className="mt-2 capitalize">
                  Community Member
                </Badge>
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

    </div>
  );
}
