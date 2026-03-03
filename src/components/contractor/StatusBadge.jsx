import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const statusConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  booked: {
    label: 'Booked',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  on_vacation: {
    label: 'On Vacation',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock
  }
};

export default function StatusBadge({ status = 'available', size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.available;
  const Icon = config.icon;
  const sizeClasses = size === 'lg' 
    ? 'px-3 py-2 text-sm' 
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.color} rounded-full font-semibold ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {config.label}
    </span>
  );
}