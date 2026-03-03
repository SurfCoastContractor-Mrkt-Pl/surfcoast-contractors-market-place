import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Calendar, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MilestoneList({ milestones, scopeId, isContractor }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectMilestone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', scopeId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectMilestone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', scopeId] });
    }
  });

  const handleStatusChange = (milestone, newStatus) => {
    const data = { status: newStatus };
    if (newStatus === 'completed') {
      data.completed_date = new Date().toISOString().split('T')[0];
      data.completed_by = 'current_user@example.com';
    }
    updateMutation.mutate({ id: milestone.id, data });
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No milestones yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map(milestone => (
        <div
          key={milestone.id}
          className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => {
                  const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
                  handleStatusChange(milestone, newStatus);
                }}
                disabled={!isContractor}
                className="mt-1 hover:opacity-70 disabled:opacity-50 transition-opacity"
              >
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${milestone.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {milestone.title}
                </h4>
                {milestone.description && (
                  <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                  {milestone.status === 'completed' && milestone.completed_date && (
                    <span className="text-green-600">
                      • Completed {format(new Date(milestone.completed_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {isContractor && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(milestone.id)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(milestone.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}