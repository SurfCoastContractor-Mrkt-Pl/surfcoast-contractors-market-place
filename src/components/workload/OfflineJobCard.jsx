import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Phone, Mail, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function OfflineJobCard({ scope, contractor, isOnline }) {
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(scope.status);
  const queryClient = useQueryClient();
  const { recordChange } = useOfflineSync(contractor?.email);

  const statusOptions = ['pending_approval', 'approved', 'completed', 'cancelled'];
  const statusColors = {
    pending_approval: 'bg-yellow-50 border-yellow-200',
    approved: 'bg-green-50 border-green-200',
    completed: 'bg-blue-50 border-blue-200',
    cancelled: 'bg-red-50 border-red-200',
  };

  const statusTextColors = {
    pending_approval: 'text-yellow-700',
    approved: 'text-green-700',
    completed: 'text-blue-700',
    cancelled: 'text-red-700',
  };

  // Update status locally first, sync later
  const handleStatusChange = async (newStatus) => {
    const oldStatus = scope.status;
    setLocalStatus(newStatus);

    // Record for later sync
    await recordChange('ScopeOfWork', scope.id, 'status', newStatus, oldStatus);

    // Show feedback
    queryClient.invalidateQueries({ queryKey: ['myDayScopes'] });
  };

  return (
    <div className={`rounded-lg border p-6 transition-all ${statusColors[localStatus]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{scope.job_title}</h3>

          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded mb-4 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-700" />
              <span className="text-yellow-700 font-semibold">Offline Mode - Changes will sync when online</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
            {scope.agreed_work_date && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{scope.agreed_work_date}</span>
              </div>
            )}
            {scope.cost_amount && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">${scope.cost_amount}</span>
                <span className="text-xs">({scope.cost_type})</span>
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className="bg-white rounded p-4 mb-4 space-y-2">
            <p className="font-semibold text-slate-900">{scope.client_name}</p>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <a href={`tel:${scope.client_email}`} className="hover:text-blue-600">
                Contact Client
              </a>
            </div>
            {scope.client_email && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="text-xs">{scope.client_email}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusTextColors[localStatus]}`}>
              {localStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Expandable Details */}
          {expanded && (
            <div className="bg-white rounded p-4 mt-4 space-y-4">
              {scope.scope_summary && (
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Scope Summary</p>
                  <p className="text-slate-600 text-sm">{scope.scope_summary}</p>
                </div>
              )}
              {scope.estimated_hours && (
                <div>
                  <p className="font-semibold text-slate-900">Estimated Hours</p>
                  <p className="text-slate-600">{scope.estimated_hours} hours</p>
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900 mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                        localStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 p-2 hover:bg-slate-200 rounded-lg transition-all"
        >
          {expanded ? (
            <ChevronUp className="w-6 h-6 text-slate-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
}