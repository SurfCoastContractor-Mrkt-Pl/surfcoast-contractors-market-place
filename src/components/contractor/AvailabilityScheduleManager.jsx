import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { addDays, format, startOfWeek, eachDayOfInterval } from 'date-fns';

export default function AvailabilityScheduleManager({ contractor, contractorEmail }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([
    { id: 1, date: '2026-03-23', start: '09:00', end: '17:00', available: true },
    { id: 2, date: '2026-03-24', start: '09:00', end: '17:00', available: true },
    { id: 3, date: '2026-03-25', start: '09:00', end: '12:00', available: true },
  ]);

  const [newSlot, setNewSlot] = useState({ start: '09:00', end: '17:00' });

  const weekStart = startOfWeek(new Date());
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const weekSlots = useMemo(() => {
    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySlots = slots.filter(s => s.date === dateStr);
      return { date: day, dateStr, slots: daySlots };
    });
  }, [slots, weekDays]);

  const addSlot = () => {
    if (newSlot.start && newSlot.end) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setSlots([...slots, {
        id: Math.max(...slots.map(s => s.id), 0) + 1,
        date: dateStr,
        start: newSlot.start,
        end: newSlot.end,
        available: true
      }]);
      setNewSlot({ start: '09:00', end: '17:00' });
    }
  };

  const removeSlot = (id) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const statusColor = contractor?.availability_status === 'available'
    ? 'bg-green-50 border-green-200'
    : contractor?.availability_status === 'booked'
    ? 'bg-amber-50 border-amber-200'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className={`p-6 border ${statusColor}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Availability</h3>
            <p className="text-sm text-slate-600">
              Status: <span className="font-semibold capitalize">{contractor?.availability_status || 'available'}</span>
            </p>
          </div>
          {contractor?.availability_status === 'available' ? (
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant={contractor?.availability_status === 'available' ? 'default' : 'outline'}
            className="text-sm"
          >
            Available Now
          </Button>
          <Button
            variant={contractor?.availability_status === 'booked' ? 'default' : 'outline'}
            className="text-sm"
          >
            Currently Booked
          </Button>
        </div>
      </Card>

      {/* Schedule Management */}
      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="manage">Manage Slots</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Hours</TabsTrigger>
        </TabsList>

        {/* Week View */}
        <TabsContent value="week">
          <div className="space-y-3">
            {weekSlots.map(day => (
              <Card key={day.dateStr} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">
                    {format(day.date, 'EEEE, MMM d')}
                  </h4>
                  {day.slots.length > 0 && (
                    <Badge className="bg-green-100 text-green-700">{day.slots.length} slot(s)</Badge>
                  )}
                </div>

                {day.slots.length > 0 ? (
                  <div className="space-y-2">
                    {day.slots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">Available</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-2">No availability scheduled</p>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Manage Slots */}
        <TabsContent value="manage" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Availability Slot</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.start}
                    onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSlot.end}
                    onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <Button onClick={addSlot} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Slot
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Slots</h3>
            {slots.length > 0 ? (
              <div className="space-y-2">
                {slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{format(new Date(slot.date), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-slate-600">{slot.start} - {slot.end}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlot(slot.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No availability slots added</p>
            )}
          </Card>
        </TabsContent>

        {/* Recurring Hours */}
        <TabsContent value="recurring">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Set Recurring Hours</h3>

            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900 w-20">{day}</span>
                  <div className="flex items-center gap-2">
                    <input type="time" defaultValue="09:00" className="px-2 py-1 border border-slate-300 rounded text-sm" />
                    <span className="text-slate-600">to</span>
                    <input type="time" defaultValue="17:00" className="px-2 py-1 border border-slate-300 rounded text-sm" />
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              ))}
            </div>

            <Button className="w-full">Save Recurring Hours</Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>Pro tip:</strong> Keep your availability updated so customers can book time slots that work best for you.
        </p>
      </Card>
    </div>
  );
}