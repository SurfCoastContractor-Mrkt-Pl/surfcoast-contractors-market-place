import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

const statuses = [
  {
    id: 'available',
    label: 'Available',
    description: 'Ready to take on new projects',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle
  },
  {
    id: 'booked',
    label: 'Booked',
    description: 'Currently working on projects',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Clock
  },
  {
    id: 'on_vacation',
    label: 'On Vacation',
    description: 'Away, will respond later',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock
  }
];

export default function AvailabilityStatusManager({ contractorId, currentStatus = 'available', onStatusChange }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (newStatus) => base44.entities.Contractor.update(contractorId, { availability_status: newStatus }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contractor', contractorId] });
      onStatusChange?.(data.availability_status);
    }
  });

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    await updateMutation.mutateAsync(newStatus);
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">Availability Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statuses.map(status => {
          const Icon = status.icon;
          const isActive = currentStatus === status.id;
          
          return (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              disabled={loading || updateMutation.isPending}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? `${status.color} border-current`
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{status.label}</p>
                  <p className="text-xs opacity-75 mt-1">{status.description}</p>
                </div>
                {isActive && !loading && (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {loading && isActive && (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Your availability status is displayed on your profile and helps clients understand your current capacity.
      </p>
    </Card>
  );
}