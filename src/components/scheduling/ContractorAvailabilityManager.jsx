import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function ContractorAvailabilityManager({ scopeId, contractorEmail }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const { data: slots = [], refetch } = useQuery({
    queryKey: ['availabilitySlots', scopeId, contractorEmail],
    queryFn: async () => {
      return await base44.asServiceRole.entities.AvailabilitySlot.filter({
        contractor_email: contractorEmail,
        scope_id: scopeId
      });
    }
  });

  const createSlotMutation = useMutation({
    mutationFn: async (slotData) => {
      return await base44.asServiceRole.entities.AvailabilitySlot.create(slotData);
    },
    onSuccess: () => {
      refetch();
      setSelectedDate('');
      setStartTime('09:00');
      setEndTime('17:00');
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId) => {
      return await base44.asServiceRole.entities.AvailabilitySlot.delete(slotId);
    },
    onSuccess: () => {
      refetch();
    }
  });

  const handleAddAvailability = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    createSlotMutation.mutate({
      contractor_email: contractorEmail,
      scope_id: scopeId,
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      available: true
    });
  };

  const handleBlockDate = async () => {
    if (!selectedDate || !blockReason) {
      alert('Please select a date and provide a reason');
      return;
    }

    setIsBlocking(true);
    try {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: `blocked:${scopeId}:${contractorEmail}`,
        action: 'blocked_date',
        user_email: contractorEmail,
        request_count: 1,
        window_start: new Date(selectedDate).toISOString()
      });
      refetch();
      setSelectedDate('');
      setBlockReason('');
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Availability */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Set Availability
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAddAvailability}
            disabled={createSlotMutation.isPending}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
      </Card>

      {/* Block Date */}
      <Card className="p-6 border-orange-200 bg-orange-50">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Block Date/Time
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Reason</label>
            <Input
              placeholder="e.g., Personal appointment, sick leave"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </div>

          <Button
            onClick={handleBlockDate}
            disabled={isBlocking}
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Block This Date
          </Button>
        </div>
      </Card>

      {/* Current Availability */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Current Availability</h3>

        {slots.length === 0 ? (
          <p className="text-sm text-slate-500">No availability set yet</p>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="text-sm">
                  <p className="font-medium text-slate-900">
                    {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-slate-600">{slot.start_time} - {slot.end_time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSlotMutation.mutate(slot.id)}
                  disabled={deleteSlotMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}