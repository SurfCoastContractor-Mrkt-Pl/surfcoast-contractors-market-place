import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RatingBlockStatusWidget({ userEmail, userType }) {
  const [status, setStatus] = useState(null);
  const [pendingScope, setPendingScope] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatingStatus = async () => {
      try {
        if (userType === 'contractor') {
          const contractors = await base44.entities.Contractor.filter({ email: userEmail });
          if (contractors?.length > 0) {
            const contractor = contractors[0];
            if (contractor.rating_block_active && contractor.pending_rating_scope_id) {
              setStatus('blocked');
              const scope = await base44.entities.ScopeOfWork.filter({ id: contractor.pending_rating_scope_id });
              if (scope?.length > 0) {
                setPendingScope(scope[0]);
              }
            } else {
              setStatus('clear');
            }
          }
        } else if (userType === 'customer') {
          const customers = await base44.entities.CustomerProfile.filter({ email: userEmail });
          if (customers?.length > 0) {
            const customer = customers[0];
            if (customer.rating_block_active && customer.pending_rating_scope_id) {
              setStatus('blocked');
              const scope = await base44.entities.ScopeOfWork.filter({ id: customer.pending_rating_scope_id });
              if (scope?.length > 0) {
                setPendingScope(scope[0]);
              }
            } else {
              setStatus('clear');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch rating status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchRatingStatus();
    }
  }, [userEmail, userType]);

  if (loading) {
    return (
      <div className="p-4 bg-slate-100 rounded-lg animate-pulse h-20" />
    );
  }

  if (status === 'clear') {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">Pending Rating Required</h3>
          <p className="text-sm text-red-800 mb-3">
            You're blocked from {userType === 'contractor' ? 'accepting new jobs' : 'posting new jobs'} until you submit your rating for a completed project.
          </p>
          {pendingScope && (
            <div className="bg-white p-3 rounded text-sm mb-3 border border-red-100">
              <p className="text-slate-700">
                <span className="font-medium">Job:</span> {pendingScope.job_title}
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Completed: {pendingScope.agreed_work_date}
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.href = `/ProjectManagement${pendingScope ? `#${pendingScope.id}` : ''}`}
            className="text-sm font-medium text-red-600 hover:text-red-700 underline"
          >
            Submit your rating →
          </button>
        </div>
      </div>
    </div>
  );
}