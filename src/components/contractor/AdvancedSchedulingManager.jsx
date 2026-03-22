import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Clock, Calendar as CalendarIcon, Trash2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function AdvancedSchedulingManager({ contractorId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weekView, setWeekView] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    recurringDays: [],
  });

  const queryClient = useQueryClient();

  const { data: slots } = useQuery({
    queryKey: ['availability-slots', contractorId],
    queryFn: () => base44.entities.AvailabilitySlot.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (data.isRecurring && data.recurringDays.length > 0) {
        const creates = data.recurringDays.map(day => ({
          contractor_id: contractorId,
          date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
          available: true,
          recurring_day: day,
        }));
        return Promise.all(creates.map(c => base44.entities.AvailabilitySlot.create(c)));
      } else {
        return base44.entities.AvailabilitySlot.create({
          contractor_id: contractorId,
          date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
          available: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots', contractorId] });
      resetForm();
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailabilitySlot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots', contractorId] });
    },
  });

  const handleSubmit = () => {
    if (formData.startTime && formData.endTime) {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      recurringDays: [],
    });
  };

  const getWeeklyHours = useMemo(() => {
    if (!slots) return {};
    const weekly = {};
    DAYS.forEach(day => {
      weekly[day] = slots.filter(s => {
        const d = new Date(s.date);
        return d.toLocaleDateString('en-US', { weekday: 'long' }) === day && s.available;
      }).map(s => s.start_time);
    });
    return weekly;
  }, [slots]);

  const hoursPerDay = useMemo(() => {
    if (!slots) return 0;
    const totalHours = slots.reduce((sum, s) => {
      const start = parseInt(s.start_time);
      const end = parseInt(s.end_time);
      return sum + (end - start);
    }, 0);
    return totalHours;
  }, [slots]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Advanced Scheduling</h2>
          <p className="text-xs text-slate-500 mt-1">Manage availability and time blocking</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ backgroundColor: '#1E5A96' }}>
              <Plus className="w-4 h-4" />
              Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Availability Slot</DialogTitle>
              <DialogDescription>Set when you're available for work.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Recurring</label>
                  <select
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="false">One-time</option>
                    <option value="true">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Start Time</label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">End Time</label>
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Days of Week</label>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          const updated = formData.recurringDays.includes(day)
                            ? formData.recurringDays.filter(d => d !== day)
                            : [...formData.recurringDays, day];
                          setFormData({ ...formData, recurringDays: updated });
                        }}
                        className={`p-2 text-xs rounded font-semibold transition-all ${
                          formData.recurringDays.includes(day)
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="flex-1 text-white"
                  style={{ backgroundColor: '#1E5A96' }}
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Slot'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 bg-blue-50">
          <p className="text-xs text-slate-600">Total Available Hours</p>
          <p className="text-2xl font-bold text-blue-600">{hoursPerDay}h</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-xs text-slate-600">Scheduled Slots</p>
          <p className="text-2xl font-bold text-green-600">{slots?.length || 0}</p>
        </Card>
      </div>

      {/* Weekly View */}
      {weekView && (
        <div className="space-y-2 mb-6">
          {DAYS.map(day => (
            <div key={day} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{day}</h3>
                <span className="text-xs text-slate-500">{getWeeklyHours[day]?.length || 0} slots</span>
              </div>
              {getWeeklyHours[day] && getWeeklyHours[day].length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {getWeeklyHours[day].map((time, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {time}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">No availability set</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Slots List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">All Availability Slots</h3>
        {slots && slots.length > 0 ? (
          slots.map(slot => (
            <div key={slot.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{new Date(slot.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{slot.start_time} - {slot.end_time}</p>
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(slot.id)}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-slate-500 text-sm">No availability slots yet</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Tip:</strong> Set recurring weekly schedules to automatically make yourself available on specific days.
        </p>
      </div>
    </Card>
  );
}