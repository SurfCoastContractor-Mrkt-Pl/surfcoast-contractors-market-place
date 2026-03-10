import React, { useState, useEffect } from 'react';
import { Calendar, Send, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CustomerBookingCalendar({ 
  contractorId, 
  contractorEmail, 
  contractorName,
  jobId,
  customerEmail,
  customerName 
}) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const allSlots = await base44.entities.AvailabilitySlot.filter({
        contractor_id: contractorId,
      });
      const available = (allSlots || []).filter(s => s.available);
      setSlots(available.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      await base44.entities.BookingRequest.create({
        job_id: jobId,
        contractor_id: contractorId,
        contractor_email: contractorEmail,
        customer_email: customerEmail,
        customer_name: customerName,
        requested_start_date: selectedSlot.date,
        requested_start_time: selectedSlot.start_time,
      });

      // Send notification email to contractor
      await base44.integrations.Core.SendEmail({
        to: contractorEmail,
        subject: `Booking Request from ${customerName}`,
        body: `Hi ${contractorName},\n\n${customerName} has requested to book your availability on ${selectedSlot.date} from ${selectedSlot.start_time} to ${selectedSlot.end_time}.\n\nPlease log in to SurfCoast to confirm or decline this booking request.\n\nSurfCoast Contractor Market Place`,
      });

      setSubmitted(true);
      setSelectedSlot(null);
      setNotes('');
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
    setSubmitting(false);
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

  if (submitted) {
    return (
      <Card className="p-6 border-green-200 bg-green-50">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-green-600 mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Booking Request Sent!</h3>
            <p className="text-sm text-green-700 mt-1">
              {contractorName} will review your request and respond shortly.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitted(false)}
              className="mt-3"
            >
              Request Another Slot
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Book with {contractorName}
        </h2>
      </div>

      {slots.length === 0 ? (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">No Available Slots</p>
            <p className="text-xs text-amber-700 mt-1">
              This contractor hasn't opened any availability slots yet. Check back soon or contact them directly.
            </p>
          </div>
        </div>
      ) : (
        <>
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
                const isSelected = selectedSlot && selectedSlot.date === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => daySlots.length > 0 && setSelectedSlot(daySlots[0])}
                    disabled={daySlots.length === 0}
                    className={`aspect-square p-1 rounded border-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : daySlots.length > 0
                        ? 'bg-green-50 border-green-300 text-slate-700 hover:border-green-400 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Slot Details */}
          {selectedSlot && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Selected Date & Time</h3>
              <div className="text-sm text-slate-700">
                <p className="font-medium">
                  {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-slate-600">
                  {selectedSlot.start_time} — {selectedSlot.end_time}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Add a Message (Optional)
            </label>
            <Textarea
              placeholder="Any special instructions or questions?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitBooking}
            disabled={!selectedSlot || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Sending...' : 'Request This Slot'}
          </Button>
        </>
      )}
    </Card>
  );
}