import React from 'react';
import { Calendar, User, DollarSign, AlertCircle } from 'lucide-react';

export default function ProjectOverview({ scope, disputes }) {
  const activeDisputeStatus = disputes.find(d => ['open', 'in_review', 'under_mediation'].includes(d.status));

  return (
    <div className="space-y-6">
      {/* Alert if dispute exists */}
      {activeDisputeStatus && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px' }}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400">Active Dispute</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              A dispute is open on this project: <span className="font-medium">{activeDisputeStatus.title}</span>
            </p>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
        <h2 className="text-xl font-semibold text-white mb-6">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Total Cost</p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${scope.cost_amount} <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>/{scope.cost_type}</span>
            </p>
          </div>

          {/* Scheduled Date */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Scheduled Date</p>
            </div>
            <p className="text-lg font-semibold text-white">
              {scope.agreed_work_date ? new Date(scope.agreed_work_date).toLocaleDateString() : 'Not scheduled'}
            </p>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Status</p>
            </div>
            <span style={{
              background: scope.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(217,119,6,0.2)',
              color: scope.status === 'approved' ? '#4ade80' : '#fbbf24',
              fontSize: '14px', fontWeight: '600', padding: '6px 12px', borderRadius: '6px', display: 'inline-block'
            }}>
              {scope.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Estimated Hours (if hourly) */}
          {scope.cost_type === 'hourly' && scope.estimated_hours && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm mb-2">Estimated Hours</p>
              <p className="text-lg font-semibold text-white">{scope.estimated_hours} hours</p>
            </div>
          )}
        </div>
      </div>

      {/* Scope Summary */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
        <h2 className="text-xl font-semibold text-white mb-4">Scope of Work</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
          {scope.scope_summary || scope.customer_scope_details || 'No scope summary available'}
        </p>
      </div>

      {/* Photos */}
      {scope.after_photo_urls && scope.after_photo_urls.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
          <h2 className="text-xl font-semibold text-white mb-4">Project Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {scope.after_photo_urls.map((url, idx) => (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                <img src={url} alt={`Project photo ${idx + 1}`} className="w-full h-40 object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}