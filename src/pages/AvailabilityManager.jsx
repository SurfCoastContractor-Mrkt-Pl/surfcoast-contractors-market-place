import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AvailabilityManager() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', startTime: '09:00', endTime: '17:00' });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: slots = [] } = useQuery({
    queryKey: ['availabilitySlots', user?.email],
    queryFn: () => user?.email ? 
      base44.entities.AvailabilitySlot.filter({ created_by: user.email }) : 
      [],
    enabled: !!user?.email
  });

  const { data: conflicts = [] } = useQuery({
    queryKey: ['availabilityConflicts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await base44.functions.invoke('smartAvailabilityCheck', {});
      return response?.data?.conflictsResolved || 0;
    },
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (!data.date || !data.startTime || !data.endTime) throw new Error('All fields required');
      return base44.entities.AvailabilitySlot.create({
        contractor_id: user.id,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        available: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilitySlots'] });
      setFormData({ date: '', startTime: '09:00', endTime: '17:00' });
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailabilitySlot.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availabilitySlots'] })
  });

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!user) return <div style={{ padding: 24, textAlign: "center", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>Loading...</div>;

  const upcomingSlots = slots
    .filter(s => s.available && new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 896, margin: "0 auto", padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2rem)", fontWeight: 800, color: T.dark, margin: 0, fontStyle: "italic" }}>Availability Schedule</h1>
          <p style={{ color: T.muted, marginTop: 8, fontStyle: "italic" }}>Smart scheduling prevents double-booking conflicts automatically</p>
        </div>

        {conflicts > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <p className="text-orange-900">{conflicts} scheduling conflicts were automatically resolved</p>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Availability
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Availability Window</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createMutation.mutate(formData)} className="flex-1">
                  Add Slot
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {upcomingSlots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-600">
                No available slots. Add your first availability window.
              </CardContent>
            </Card>
          ) : (
            upcomingSlots.map(slot => (
              <Card key={slot.id}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-900">{format(new Date(slot.date), 'EEE, MMM d')}</p>
                      <p className="text-sm text-slate-600">{slot.start_time} - {slot.end_time}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                  <Button
                    onClick={() => deleteMutation.mutate(slot.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}