import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function AvailabilityStatusManager({ contractor }) {
  const [status, setStatus] = useState(contractor?.availability_status || 'available');
  const queryClient = useQueryClient();

  const statusIcons = {
    available: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    booked: <Clock className="w-5 h-5 text-amber-600" />,
    on_vacation: <AlertCircle className="w-5 h-5 text-slate-600" />,
  };

  const statusLabels = {
    available: 'Available for New Work',
    booked: 'Currently Booked',
    on_vacation: 'On Vacation',
  };

  const statusColors = {
    available: 'bg-green-50 border-green-200',
    booked: 'bg-amber-50 border-amber-200',
    on_vacation: 'bg-slate-50 border-slate-200',
  };

  const mutation = useMutation({
    mutationFn: async (newStatus) => {
      await base44.entities.Contractor.update(contractor.id, {
        availability_status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    },
  });

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    mutation.mutate(newStatus);
  };

  return (
    <Card className={`p-6 border ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusIcons[status]}
          <div>
            <h3 className="font-semibold text-slate-900">Availability Status</h3>
            <p className="text-sm text-slate-600">{statusLabels[status]}</p>
          </div>
        </div>
      </div>
      <Select value={status} onValueChange={handleStatusChange} disabled={mutation.isPending}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="available">Available for New Work</SelectItem>
          <SelectItem value="booked">Currently Booked</SelectItem>
          <SelectItem value="on_vacation">On Vacation</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-slate-500 mt-2">
        Your status appears on your profile and helps customers know your availability.
      </p>
    </Card>
  );
}