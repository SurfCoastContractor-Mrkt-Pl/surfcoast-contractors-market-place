import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComplianceAppealReview() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const data = await base44.asServiceRole.entities.ComplianceAppeal.filter({
          status: 'pending',
        });
        setAppeals(data || []);
      } catch (error) {
        console.error('Failed to fetch appeals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, []);

  const handleReviewAppeal = async (appealId, approved) => {
    try {
      setReviewingId(appealId);
      const appeal = appeals.find((a) => a.id === appealId);

      // Update appeal status
      await base44.asServiceRole.entities.ComplianceAppeal.update(appealId, {
        status: approved ? 'approved' : 'rejected',
        admin_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin', // In production, use actual admin email
      });

      // If approved, unlock the contractor
      if (approved) {
        const contractors = await base44.asServiceRole.entities.Contractor.filter({
          email: appeal.contractor_email,
        });

        if (contractors && contractors.length > 0) {
          const updates = {};

          if (appeal.violation_type === 'payment_compliance') {
            updates.payment_compliant = true;
            updates.payment_lock_grace_until = null;
          } else if (appeal.violation_type === 'minor_hours') {
            updates.minor_hours_locked = false;
            updates.minor_hours_lock_until = null;
          } else if (appeal.violation_type === 'after_photo') {
            updates.account_locked = false;
            updates.locked_scope_id = null;
          }

          await base44.asServiceRole.entities.Contractor.update(contractors[0].id, updates);
        }
      }

      // Refresh appeals
      setAppeals((prev) => prev.filter((a) => a.id !== appealId));
      setSelectedAppeal(null);
      setReviewNotes('');
      alert(`Appeal ${approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      alert('Failed to review appeal');
      console.error(error);
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading appeals...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Appeals</CardTitle>
          <CardDescription>{appeals.length} appeal(s) awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          {appeals.length === 0 ? (
            <p className="text-sm text-slate-500">No pending appeals</p>
          ) : (
            <div className="space-y-3">
              {appeals.map((appeal) => (
                <div key={appeal.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{appeal.contractor_email}</p>
                      <p className="text-xs text-slate-600">
                        {appeal.violation_type.replace(/_/g, ' ')} • Submitted{' '}
                        {new Date(appeal.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAppeal(appeal)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAppeal && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Review Appeal</CardTitle>
            <CardDescription>
              {selectedAppeal.contractor_email} • {selectedAppeal.violation_type.replace(/_/g, ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contractor's Reason
              </label>
              <div className="p-3 bg-white rounded border border-slate-200 text-sm text-slate-700">
                {selectedAppeal.appeal_reason}
              </div>
            </div>

            {selectedAppeal.evidence_urls && selectedAppeal.evidence_urls.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Submitted Evidence
                </label>
                <div className="space-y-2">
                  {selectedAppeal.evidence_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-white rounded border border-slate-200 text-sm text-blue-600 hover:underline"
                    >
                      Evidence {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document your decision and reasoning..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleReviewAppeal(selectedAppeal.id, true)}
                disabled={reviewingId === selectedAppeal.id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve & Unlock
              </Button>
              <Button
                onClick={() => handleReviewAppeal(selectedAppeal.id, false)}
                disabled={reviewingId === selectedAppeal.id}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setSelectedAppeal(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}