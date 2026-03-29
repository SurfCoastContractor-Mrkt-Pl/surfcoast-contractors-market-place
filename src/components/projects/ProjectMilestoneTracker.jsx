import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Lock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectMilestoneTracker({ scopeId, hasSubscription, isContractor }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!scopeId || !hasSubscription) return;

    const fetchMilestones = async () => {
      try {
        const ms = await base44.entities.ProjectMilestone.filter({ scope_id: scopeId });
        setMilestones(ms.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching milestones:', error);
        setLoading(false);
      }
    };

    fetchMilestones();
    const unsubscribe = base44.entities.ProjectMilestone.subscribe((event) => {
      if (event.data?.scope_id === scopeId) {
        if (event.type === 'create') {
          setMilestones(prev => [...prev, event.data].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        } else if (event.type === 'update') {
          setMilestones(prev => prev.map(m => m.id === event.id ? event.data : m));
        } else if (event.type === 'delete') {
          setMilestones(prev => prev.filter(m => m.id !== event.id));
        }
      }
    });

    return unsubscribe;
  }, [scopeId, hasSubscription]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.trim() || !isContractor) return;

    setAdding(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ProjectMilestone.create({
        scope_id: scopeId,
        contractor_email: user.email,
        milestone_name: newMilestone.trim(),
        status: 'pending',
        order_index: milestones.length
      });
      setNewMilestone('');
      toast.success('Milestone added');
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('Failed to add milestone');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleMilestone = async (milestone) => {
    try {
      const newStatus = milestone.status === 'pending' ? 'completed' : 'pending';
      await base44.entities.ProjectMilestone.update(milestone.id, {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await base44.entities.ProjectMilestone.delete(milestoneId);
      toast.success('Milestone deleted');
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
    }
  };

  if (!hasSubscription) {
    return (
      <Card className="p-6 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3 text-slate-600">
          <Lock className="w-5 h-5" />
          <div>
            <p className="font-medium">Milestone Tracking Locked</p>
            <p className="text-sm">Subscribe to the $50/month Communication plan to track project milestones.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Project Milestones</h3>

        {isContractor && (
          <form onSubmit={handleAddMilestone} className="flex gap-2">
            <Input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone..."
              disabled={adding}
            />
            <Button type="submit" size="sm" disabled={adding || !newMilestone.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading milestones...</p>
        ) : milestones.length === 0 ? (
          <p className="text-sm text-slate-500">No milestones defined yet</p>
        ) : (
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
              >
                <button
                  onClick={() => handleToggleMilestone(milestone)}
                  disabled={!isContractor}
                  className="flex-shrink-0 focus:outline-none"
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${milestone.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {milestone.milestone_name}
                  </p>
                  {milestone.due_date && (
                    <p className="text-xs text-slate-500">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                {isContractor && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}