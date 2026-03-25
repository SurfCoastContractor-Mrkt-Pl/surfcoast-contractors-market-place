import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const RESOLUTION_TYPES = [
  { value: 'mutual_agreement', label: 'Mutual Agreement' },
  { value: 'admin_decision', label: 'Admin Decision' },
  { value: 'refund_issued', label: 'Refund Issued' },
  { value: 'work_remedied', label: 'Work Remedied' },
  { value: 'none', label: 'No Resolution' },
];

export default function AdminDisputeReview({ scopeId, disputes, onUpdate }) {
  const [selectedDispute, setSelectedDispute] = useState(disputes[0] || null);
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionType, setResolutionType] = useState('admin_decision');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDispute || !adminNotes.trim()) {
      alert('Please select a dispute and add admin notes.');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Dispute.update(selectedDispute.id, {
        status: 'resolved',
        resolution_type: resolutionType,
        resolution_details: resolutionDetails,
        admin_notes: adminNotes,
        assigned_to_admin: resolvingDispute,
        resolved_at: new Date().toISOString(),
      });

      setAdminNotes('');
      setResolutionDetails('');
      setResolutionType('admin_decision');
      onUpdate();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      alert('Failed to resolve dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!disputes || disputes.length === 0) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>No disputes on this project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dispute List */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px' }}>
        <h3 className="text-lg font-semibold text-white mb-4">Project Disputes</h3>
        <div className="space-y-2">
          {disputes.map(dispute => (
            <button
              key={dispute.id}
              onClick={() => setSelectedDispute(dispute)}
              style={{
                background: selectedDispute?.id === dispute.id ? 'rgba(29,111,164,0.2)' : 'rgba(255,255,255,0.05)',
                border: selectedDispute?.id === dispute.id ? '1px solid rgba(29,111,164,0.5)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="hover:opacity-80"
            >
              <p className="text-white font-medium">{dispute.title}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {dispute.dispute_number} • Initiator: {dispute.initiator_name} • Status: <span style={{ color: dispute.status === 'resolved' ? '#4ade80' : '#fbbf24' }}>{dispute.status}</span>
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Dispute Details & Resolution */}
      {selectedDispute && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
          <h3 className="text-lg font-semibold text-white mb-6">Review & Resolve</h3>

          {/* Dispute Info */}
          <div className="mb-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-white mb-1">Initiator</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedDispute.initiator_name} ({selectedDispute.initiator_type})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Respondent</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedDispute.respondent_name} ({selectedDispute.respondent_type})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Category</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedDispute.category.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Severity</p>
              <span style={{
                background: selectedDispute.severity === 'critical' ? 'rgba(239,68,68,0.2)' : selectedDispute.severity === 'high' ? 'rgba(217,119,6,0.2)' : 'rgba(59,130,246,0.2)',
                color: selectedDispute.severity === 'critical' ? '#f87171' : selectedDispute.severity === 'high' ? '#fbbf24' : '#60a5fa',
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {selectedDispute.severity}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Issue Description</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedDispute.description}</p>
            </div>
            {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-white mb-2">Evidence</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDispute.evidence_urls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }} className="text-sm underline hover:text-blue-300">
                      Evidence {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Form */}
          {selectedDispute.status !== 'resolved' && (
            <form onSubmit={handleResolveDispute} className="space-y-4 border-t border-slate-700 pt-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Resolution Type</label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', width: '100%' }}
                  className="text-sm"
                >
                  {RESOLUTION_TYPES.map(type => (
                    <option key={type.value} value={type.value} style={{ background: '#1a1a1a' }}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Resolution Details</label>
                <textarea
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  placeholder="Describe the resolution (e.g., refund amount, remediation steps, etc.)"
                  rows={3}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', width: '100%', fontFamily: 'inherit' }}
                  className="text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Admin Notes *</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Document your decision and reasoning"
                  rows={4}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', width: '100%', fontFamily: 'inherit' }}
                  className="text-sm resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                style={{ background: '#1d6fa4', color: '#fff', padding: '10px 20px', fontWeight: '600', width: '100%' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  'Mark Dispute as Resolved'
                )}
              </Button>
            </form>
          )}

          {selectedDispute.status === 'resolved' && (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-400">Dispute Resolved</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Resolution: {selectedDispute.resolution_type} • {selectedDispute.resolved_at && new Date(selectedDispute.resolved_at).toLocaleDateString()}
                  </p>
                  {selectedDispute.resolution_details && (
                    <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedDispute.resolution_details}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}