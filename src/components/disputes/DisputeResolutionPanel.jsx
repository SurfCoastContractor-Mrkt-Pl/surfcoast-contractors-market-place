import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

const RESOLUTION_TYPES = [
  { value: 'mutual_agreement', label: 'Mutual Agreement' },
  { value: 'admin_decision', label: 'Admin Decision' },
  { value: 'refund_issued', label: 'Refund Issued' },
  { value: 'work_remedied', label: 'Work Remedied' },
  { value: 'none', label: 'No Resolution' }
];

export default function DisputeResolutionPanel({ dispute, onResolved }) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const handleResolve = async () => {
    if (!resolutionType) {
      alert('Please select a resolution type');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('resolveDispute', {
        dispute_id: dispute.id,
        resolution_type: resolutionType,
        resolution_details: resolutionDetails,
        admin_notes: adminNotes
      });

      if (response.data.success) {
        onResolved();
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Resolution error:', error);
      alert('Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Dispute Resolution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              This dispute affects related progress payments which are currently paused.
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Resolve Dispute
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Dispute: {dispute.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Dispute Summary */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Initiator</p>
                    <p className="font-medium">{dispute.initiator_name}</p>
                    <p className="text-xs text-slate-500">{dispute.initiator_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Respondent</p>
                    <p className="font-medium">{dispute.respondent_name}</p>
                    <p className="text-xs text-slate-500">{dispute.respondent_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Category</p>
                    <p className="font-medium capitalize">{dispute.category.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Severity</p>
                    <p className="font-medium capitalize">{dispute.severity}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{dispute.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Resolution Type</label>
                <Select value={resolutionType} onValueChange={setResolutionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Resolution Details</label>
                <Textarea
                  placeholder="Explain the resolution and any actions taken..."
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  className="h-24"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes (Internal)</label>
                <Textarea
                  placeholder="Internal notes about this resolution..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="h-20"
                />
              </div>

              {/* Resolution Effects */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-blue-900">Resolution Effects:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  {resolutionType === 'refund_issued' && (
                    <li>✓ All paid progress payments will be cancelled</li>
                  )}
                  {resolutionType === 'work_remedied' && (
                    <li>✓ Paused payments will be resumed for contractor completion</li>
                  )}
                  <li>✓ Both parties will be notified via email</li>
                  <li>✓ Dispute status will be marked as "resolved"</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve Dispute
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}