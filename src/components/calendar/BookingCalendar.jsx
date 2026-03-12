import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';

export default function BookingCalendar({ contractorId, contractorName, contractorEmail, customerEmail, customerName, jobTitle }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const queryClient = useQueryClient();

  const { data: availableSlots } = useQuery({
    queryKey: ['availability', contractorId],
    queryFn: () => base44.entities.AvailabilitySlot.filter({ contractor_id: contractorId, available: true }),
    enabled: !!contractorId,
  });

  const { data: existingRequest } = useQuery({
    queryKey: ['booking-request', contractorId, customerEmail],
    queryFn: () => base44.entities.BookingRequest.filter({
      contractor_id: contractorId,
      customer_email: customerEmail,
      status: 'pending'
    }),
    enabled: !!contractorId && !!customerEmail,
  });

  const bookMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.BookingRequest.create({
        job_id: data.jobId,
        contractor_id: contractorId,
        contractor_email: contractorEmail,
        customer_email: customerEmail,
        customer_name: customerName,
        requested_start_date: data.date,
        requested_start_time: data.time,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-request', contractorId, customerEmail] });
      setSelectedDate(null);
      setSelectedTime(null);
    },
  });

  const availableDates = availableSlots?.map(slot => new Date(slot.date)) || [];
  const slotsForDate = selectedDate 
    ? availableSlots?.filter(s => new Date(s.date).toDateString() === selectedDate.toDateString())
    : [];

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Schedule with {contractorName}</h3>
        
        {existingRequest && existingRequest.length > 0 ? (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Request Pending</p>
              <p className="text-xs text-blue-700 mt-1">
                Your booking request is pending contractor approval.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 block mb-3">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !availableDates.some(d => d.toDateString() === date.toDateString())}
                className="rounded-lg border border-slate-200"
              />
            </div>

            {selectedDate && (
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 block mb-3">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className={selectedTime === time ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="flex gap-2">
                <Button
                  onClick={() => bookMutation.mutate({ date: selectedDate.toISOString().split('T')[0], time: selectedTime, jobId: '' })}
                  disabled={bookMutation.isPending}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {bookMutation.isPending ? 'Booking...' : 'Request Booking'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedTime(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {!availableSlots || availableSlots.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">No Availability</p>
            <p className="text-xs text-amber-700 mt-1">
              This contractor hasn't published available dates yet. Try contacting them directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}