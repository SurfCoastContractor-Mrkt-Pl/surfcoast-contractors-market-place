import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function ProjectMilestonesTracker({ scopeId, contractorEmail, isContractor }) {
  const [newMilestone, setNewMilestone] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['projectMilestones', scopeId],
    queryFn: () => base44.entities.ProjectMilestone.filter(
      { scope_id: scopeId },
      'order_index',
      100
    ),
    enabled: !!scopeId,
  });

  const createMutation = useMutation({
    mutationFn: (name) => {
      if (!isContractor) throw new Error('Only contractors can create milestones');
      return base44.entities.ProjectMilestone.create({
        scope_id: scopeId,
        contractor_email: contractorEmail,
        milestone_name: name,
        description: '',
        status: 'pending',
        order_index: milestones.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', scopeId] });
      setNewMilestone('');
      setIsAdding(false);
    },
    onError: (error) => {
      console.error('Failed to create milestone:', error);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (milestone) => base44.entities.ProjectMilestone.update(
      milestone.id,
      {
        status: milestone.status === 'pending' ? 'completed' : 'pending',
        completed_at: milestone.status === 'pending' ? new Date().toISOString() : null,
      }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', scopeId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (!isContractor) throw new Error('Only contractors can delete milestones');
      return base44.entities.ProjectMilestone.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', scopeId] });
    },
    onError: (error) => {
      console.error('Failed to delete milestone:', error);
    },
  });

  const completionPercentage = milestones.length > 0
    ? Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Project Milestones</h3>
          <span className="text-sm font-medium text-blue-600">{completionPercentage}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 group"
            >
              <button
                onClick={() => toggleMutation.mutate(milestone)}
                className="flex-shrink-0"
                disabled={!isContractor}
              >
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${milestone.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {milestone.milestone_name}
                </p>
                {milestone.completed_at && (
                  <p className="text-xs text-slate-500">
                    Completed {format(new Date(milestone.completed_at), 'MMM d, HH:mm')}
                  </p>
                )}
              </div>
              {isContractor && (
                <button
                  onClick={() => deleteMutation.mutate(milestone.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isContractor && (
        <div className="pt-4 border-t border-slate-200">
          {isAdding ? (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Milestone name..."
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createMutation.mutate(newMilestone)}
                autoFocus
              />
              <Button
                onClick={() => createMutation.mutate(newMilestone)}
                disabled={!newMilestone.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewMilestone('');
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Milestone
            </Button>
          )}
        </div>
      )}
    </div>
  );
}