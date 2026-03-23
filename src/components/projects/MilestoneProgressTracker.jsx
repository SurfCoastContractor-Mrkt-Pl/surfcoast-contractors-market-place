import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Pending' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
  completed: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Completed' },
  approved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Approved' }
};

export default function MilestoneProgressTracker({ milestone, isContractor, isClient }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(milestone.progress_percentage || 0);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [error, setError] = useState('');

  const config = STATUS_CONFIG[milestone.status];
  const Icon = config.icon;

  const handleStatusUpdate = async (newStatus) => {
    setError('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('updateMilestoneStatus', {
        milestone_id: milestone.id,
        new_status: newStatus,
        progress_percentage: progress,
        approval_notes: approvalNotes
      });

      if (response.data.success) {
        setExpanded(false);
        setApprovalNotes('');
        // Trigger parent refresh
        window.location.reload();
      } else {
        setError(response.data.error || 'Failed to update milestone');
      }
    } catch (err) {
      setError(err.message || 'Error updating milestone');
    } finally {
      setLoading(false);
    }
  };

  const canTransition = {
    pending: isContractor ? ['in_progress'] : [],
    in_progress: isContractor ? ['completed'] : [],
    completed: isClient ? ['approved'] : [],
    approved: []
  };

  const availableTransitions = canTransition[milestone.status] || [];

  return (
    <div className={`rounded-lg border transition-all ${config.bg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:opacity-75"
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon className={`${config.color} w-5 h-5 flex-shrink-0`} />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
            <p className="text-sm text-slate-600">{config.label}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t px-4 py-4 space-y-4 bg-white/50">
          {/* Description */}
          {milestone.description && (
            <div>
              <p className="text-sm text-slate-600">{milestone.description}</p>
            </div>
          )}

          {/* Due Date */}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Due Date:</span>
            <span className="font-medium">{new Date(milestone.due_date).toLocaleDateString()}</span>
          </div>

          {/* Progress Bar (for in_progress status) */}
          {milestone.status === 'in_progress' && isContractor && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Progress: {progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Approval Notes (for completed → approved) */}
          {milestone.status === 'completed' && isClient && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Approval Notes (Optional)</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add feedback or notes..."
                className="w-full p-2 border rounded text-sm"
                rows="3"
              />
            </div>
          )}

          {/* Dates */}
          {milestone.completed_date && (
            <div className="text-sm text-slate-600">
              <span className="block">Completed: {new Date(milestone.completed_date).toLocaleDateString()}</span>
              {milestone.completed_by && <span className="text-xs">by {milestone.completed_by}</span>}
            </div>
          )}

          {milestone.approved_date && (
            <div className="text-sm text-slate-600">
              <span className="block">Approved: {new Date(milestone.approved_date).toLocaleDateString()}</span>
              {milestone.approved_by && <span className="text-xs">by {milestone.approved_by}</span>}
              {milestone.approval_notes && <span className="block italic">{milestone.approval_notes}</span>}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2 rounded bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          {availableTransitions.length > 0 && (
            <div className="flex gap-2 pt-2">
              {availableTransitions.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Send className="w-3 h-3" />
                  {STATUS_CONFIG[status].label}
                </Button>
              ))}
            </div>
          )}

          {availableTransitions.length === 0 && milestone.status !== 'approved' && (
            <p className="text-xs text-slate-500">No actions available at this stage</p>
          )}
        </div>
      )}
    </div>
  );
}