import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ContractorAvailabilityCalendar({ contractorId, contractorEmail }) {
  const [slots, setSlots] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const allSlots = await base44.entities.AvailabilitySlot.filter({
        contractor_id: contractorId,
      });
      setSlots(allSlots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const addSlot = async () => {
    if (!newDate) return;
    setLoading(true);
    try {
      await base44.entities.AvailabilitySlot.create({
        contractor_id: contractorId,
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        available: true,
      });
      setNewDate('');
      setNewStartTime('09:00');
      setNewEndTime('17:00');
      await fetchSlots();
    } catch (error) {
      console.error('Error adding slot:', error);
    }
    setLoading(false);
  };

  const deleteSlot = async (slotId) => {
    try {
      await base44.entities.AvailabilitySlot.delete(slotId);
      await fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = [];
  const totalDays = daysInMonth(selectedMonth);
  const startingDayOfWeek = firstDayOfMonth(selectedMonth);

  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= totalDays; day++) {
    calendarDays.push(day);
  }

  const slotsMap = {};
  slots.forEach(slot => {
    slotsMap[slot.date] = (slotsMap[slot.date] || []).concat(slot);
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">Availability Calendar</h2>
      </div>

      {/* Add Slot Form */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-sm text-slate-900 mb-3">Add Availability Slot</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="flex-1"
          />
          <Input
            type="time"
            value={newStartTime}
            onChange={e => setNewStartTime(e.target.value)}
            className="w-24"
          />
          <Input
            type="time"
            value={newEndTime}
            onChange={e => setNewEndTime(e.target.value)}
            className="w-24"
          />
          <Button
            onClick={addSlot}
            disabled={loading || !newDate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            >
              →
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySlots = slotsMap[dateStr] || [];
            const hasAvailability = daySlots.some(s => s.available);

            return (
              <div
                key={day}
                className={`aspect-square p-1 rounded border-2 text-xs ${
                  hasAvailability
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-700">{day}</div>
                {hasAvailability && (
                  <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slots List */}
      <div>
        <h3 className="font-semibold text-sm text-slate-900 mb-3">Your Slots</h3>
        {slots.length === 0 ? (
          <p className="text-sm text-slate-500">No availability slots added yet.</p>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-900">
                    {new Date(slot.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-slate-600">
                    {slot.start_time} — {slot.end_time}
                    {slot.available ? (
                      <span className="ml-2 text-green-600 font-medium">Available</span>
                    ) : (
                      <span className="ml-2 text-red-600 font-medium">Booked</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}