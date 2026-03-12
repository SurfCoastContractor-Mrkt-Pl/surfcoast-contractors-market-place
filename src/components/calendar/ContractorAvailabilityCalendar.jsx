import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function ContractorAvailabilityCalendar({ contractorId }) {
  const [date, setDate] = useState(new Date());

  const { data: slots } = useQuery({
    queryKey: ['availability-slots', contractorId],
    queryFn: () => base44.entities.AvailabilitySlot.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const availableDates = slots
    ?.filter((s) => s.available === true)
    .map((s) => new Date(s.date))
    .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())) || [];

  const isDateAvailable = (d) => {
    return availableDates.some(
      (ad) =>
        ad.getFullYear() === d.getFullYear() &&
        ad.getMonth() === d.getMonth() &&
        ad.getDate() === d.getDate()
    );
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={(d) => !isDateAvailable(d)}
        className="rounded-lg border border-slate-200"
      />
      <div className="text-sm text-slate-600">
        <p className="mb-2 font-semibold">Green dates = Available</p>
        {isDateAvailable(date) ? (
          <Badge className="bg-green-100 text-green-800">✓ Available on this date</Badge>
        ) : (
          <Badge variant="outline">Not available on this date</Badge>
        )}
      </div>
    </div>
  );
}