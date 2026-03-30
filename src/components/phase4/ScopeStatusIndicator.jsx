import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending_approval: {
    icon: Clock,
    label: 'Pending Approval',
    color: 'bg-amber-100 text-amber-900',
    badge: 'bg-amber-50 border-amber-200',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    color: 'bg-green-100 text-green-900',
    badge: 'bg-green-50 border-green-200',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'bg-red-100 text-red-900',
    badge: 'bg-red-50 border-red-200',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'bg-slate-100 text-slate-900',
    badge: 'bg-slate-50 border-slate-200',
  },
  pending_ratings: {
    icon: Loader2,
    label: 'Awaiting Ratings',
    color: 'bg-blue-100 text-blue-900',
    badge: 'bg-blue-50 border-blue-200',
  },
  closed: {
    icon: CheckCircle2,
    label: 'Closed',
    color: 'bg-slate-100 text-slate-900',
    badge: 'bg-slate-50 border-slate-200',
  },
};

export default function ScopeStatusIndicator({ status, showLabel = true, size = 'md' }) {
  const [isVisible, setIsVisible] = useState(true);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_approval;
  const Icon = config.icon;

  // Pulse animation for pending states
  const isPending = status.includes('pending');

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <Icon
          className={`${sizeClasses[size]} ${config.color} ${
            isPending && status === 'pending_approval' ? 'animate-pulse' : ''
          } ${status === 'pending_ratings' ? 'animate-spin' : ''}`}
        />
      </div>
      {showLabel && <span className="text-sm font-medium">{config.label}</span>}
    </div>
  );
}

export function ScopeStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_approval;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.badge}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">{config.label}</span>
    </div>
  );
}