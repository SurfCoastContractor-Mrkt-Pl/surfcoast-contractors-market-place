import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function AvailabilityStatusManager({ contractor }) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState(
    contractor?.availability_status || 'available'
  );

  const statusOptions = [
    {
      value: 'available',
      label: 'Available',
      icon: CheckCircle,
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-700',
      description: 'Accepting new jobs and inquiries',
    },
    {
      value: 'booked',
      label: 'Booked',
      icon: AlertCircle,
      color: 'bg-yellow-100 border-yellow-300',
      textColor: 'text-yellow-700',
      description: 'Currently working, limited availability',
    },
    {
      value: 'on_vacation',
      label: 'On Break',
      icon: Clock,
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-700',
      description: 'Not available for new work',
    },
  ];

  const currentStatus = statusOptions.find((s) => s.value === selectedStatus);
  const CurrentIcon = currentStatus?.icon || CheckCircle;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      await base44.entities.Contractor.update(contractor.id, {
        availability_status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor'] });
    },
  });

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Your Availability Status</h3>
          <p className="text-sm text-slate-600">This controls which new jobs you're shown.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${currentStatus.color}`}>
          <CurrentIcon className={`w-5 h-5 ${currentStatus.textColor}`} />
          <span className={`font-semibold ${currentStatus.textColor}`}>{currentStatus.label}</span>
        </div>
      </div>

      {/* Status Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStatus === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={updateStatusMutation.isPending}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `${option.color} border-current`
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              } disabled:opacity-50`}
            >
              <Icon className={`w-6 h-6 mb-2 ${isSelected ? option.textColor : 'text-slate-400'}`} />
              <p className={`font-semibold ${isSelected ? option.textColor : 'text-slate-900'}`}>
                {option.label}
              </p>
              <p className="text-xs text-slate-600 mt-1">{option.description}</p>
            </button>
          );
        })}
      </div>

      {/* Info Message */}
      {selectedStatus !== 'available' && (
        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-700">
            💡 <span className="font-semibold">Tip:</span> Change your status back to "Available" when you're ready
            to accept new jobs.
          </p>
        </div>
      )}
    </div>
  );
}