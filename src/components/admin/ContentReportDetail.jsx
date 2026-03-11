import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContentReportDetail({ report, onClose, onUpdate }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
  const [actionTaken, setActionTaken] = useState(report.action_taken || 'none');

  const handleSave = async () => {
    setUpdatingStatus(true);
    try {
      await base44.entities.ContentReport.update(report.id, {
        status: newStatus,
        admin_notes: adminNotes,
        action_taken: actionTaken,
        admin_assigned_to: (await base44.auth.me())?.email,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update report:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Summary */}
          <Card className="p-4 bg-slate-50">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  REPORTED USER
                </div>
                <div className="font-medium text-slate-900">
                  {report.target_user_name}
                </div>
                <div className="text-sm text-slate-600">
                  {report.target_user_email}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  REPORTER
                </div>
                <div className="font-medium text-slate-900">
                  {report.reporter_name}
                </div>
                <div className="text-sm text-slate-600">{report.reporter_email}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  VIOLATION
                </div>
                <Badge>{report.violation_category}</Badge>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  CONTENT TYPE
                </div>
                <Badge variant="outline">{report.content_type}</Badge>
              </div>
            </div>
          </Card>

          {/* AI Assessment */}
          {report.ai_flagged && (
            <Card className="p-4 border-orange-200 bg-orange-50">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-orange-900 mb-2">
                    AI Risk Assessment: {report.ai_risk_score}%
                  </div>
                  {report.ai_violations && report.ai_violations.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-orange-800">
                        Detected Violations:
                      </div>
                      <ul className="text-sm text-orange-700 space-y-0.5">
                        {report.ai_violations.map((v, i) => (
                          <li key={i}>• {v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Content Preview */}
          {report.content_preview && (
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Content Preview
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700 max-h-32 overflow-y-auto border border-slate-200">
                "{report.content_preview}"
              </div>
            </div>
          )}

          {/* Report Reason */}
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-2">
              Report Reason
            </div>
            <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700 border border-slate-200">
              {report.reason || 'No additional details provided'}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="actioned">Actioned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Action Taken
              </label>
              <Select value={actionTaken} onValueChange={setActionTaken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Action</SelectItem>
                  <SelectItem value="warning_issued">Warning Issued</SelectItem>
                  <SelectItem value="content_removed">Content Removed</SelectItem>
                  <SelectItem value="account_suspended">Account Suspended</SelectItem>
                  <SelectItem value="account_banned">Account Banned</SelectItem>
                  <SelectItem value="referred_to_authorities">
                    Referred to Authorities
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Notes
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Document your findings and actions..."
                className="min-h-24"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updatingStatus}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}