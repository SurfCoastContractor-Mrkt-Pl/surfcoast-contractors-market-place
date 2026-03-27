import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ScopeOfWorkMilestones({ scopeId, contractorEmail, readOnly = false }) {
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({ name: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, [scopeId]);

  const loadMilestones = async () => {
    try {
      const data = await base44.entities.ProjectMilestone.filter({
        scope_id: scopeId,
      });
      setMilestones(data || []);
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.name.trim()) return;

    try {
      await base44.entities.ProjectMilestone.create({
        scope_id: scopeId,
        contractor_email: contractorEmail,
        milestone_name: newMilestone.name,
        description: newMilestone.description,
        due_date: newMilestone.dueDate || null,
        status: 'pending',
        order_index: milestones.length,
      });

      setNewMilestone({ name: '', description: '', dueDate: '' });
      setShowForm(false);
      await loadMilestones();
    } catch (err) {
      console.error('Failed to create milestone:', err);
    }
  };

  const handleToggleMilestone = async (milestone) => {
    try {
      const newStatus = milestone.status === 'pending' ? 'completed' : 'pending';
      await base44.entities.ProjectMilestone.update(milestone.id, {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      });
      await loadMilestones();
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await base44.entities.ProjectMilestone.delete(milestoneId);
      await loadMilestones();
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">Loading milestones...</div>;
  }

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const totalCount = milestones.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Milestones</span>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-slate-600">
              {completedCount} of {totalCount} completed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Milestones list */}
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <button
                onClick={() => !readOnly && handleToggleMilestone(milestone)}
                disabled={readOnly}
                className="mt-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium ${
                    milestone.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {milestone.milestone_name}
                </p>
                {milestone.description && (
                  <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                )}
                {milestone.due_date && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>

              {!readOnly && (
                <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add milestone form */}
        {!readOnly && (
          <>
            {showForm ? (
              <form onSubmit={handleAddMilestone} className="space-y-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                <Input
                  placeholder="Milestone name (e.g., Site Prep)"
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
                  rows="2"
                />
                <Input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-slate-900 text-white">
                    Add Milestone
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Milestone
              </Button>
            )}
          </>
        )}

        {totalCount === 0 && !showForm && (
          <p className="text-center py-4 text-slate-500 text-sm">
            {readOnly ? 'No milestones' : 'No milestones yet. Add one to track progress.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}