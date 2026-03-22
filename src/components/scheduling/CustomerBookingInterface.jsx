import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Send, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function CustomerBookingInterface({ scopeId, contractorEmail, customerEmail, onBookingSuccess }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      return await base44.asServiceRole.entities.BookingRequest.create(bookingData);
    },
    onSuccess: (booking) => {
      setBookingStatus('success');
      if (onBookingSuccess) {
        onBookingSuccess(booking);
      }
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setTimeout(() => setBookingStatus(null), 3000);
    }
  });

  const handleRequestBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    bookingMutation.mutate({
      scope_id: scopeId,
      contractor_email: contractorEmail,
      customer_email: customerEmail,
      requested_date: selectedDate,
      requested_time: selectedTime,
      status: 'pending',
      notes: notes,
      created_at: new Date().toISOString()
    });
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Request Appointment
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Preferred Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Preferred Time</label>
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Notes (Optional)</label>
          <textarea
            placeholder="Any special requests or notes for the contractor..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            rows="3"
          />
        </div>

        {bookingStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Appointment requested successfully!</span>
          </div>
        )}

        <Button
          onClick={handleRequestBooking}
          disabled={bookingMutation.isPending}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          Request Appointment
        </Button>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        The contractor will review your request and confirm the appointment.
      </p>
    </Card>
  );
}