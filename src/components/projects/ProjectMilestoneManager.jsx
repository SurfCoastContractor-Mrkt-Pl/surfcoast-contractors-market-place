import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Circle, Plus, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectMilestoneManager({ scopeId, scopeStatus }) {
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' });
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', scopeId],
    queryFn: () => base44.entities.ProjectMilestone.filter({ scope_id: scopeId }, '-due_date'),
    enabled: !!scopeId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectMilestone.create({
      scope_id: scopeId,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', scopeId] });
      setNewMilestone({ title: '', description: '', due_date: '' });
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectMilestone.update(id, {
      status: 'completed',
      completed_date: new Date().toISOString().split('T')[0],
      completed_by: 'current_user'
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones', scopeId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectMilestone.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones', scopeId] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMilestone.title || !newMilestone.due_date) return;
    createMutation.mutate(newMilestone);
  };

  const isReadOnly = scopeStatus === 'closed' || scopeStatus === 'pending_ratings';

  const statusConfig = {
    pending: { icon: Circle, color: 'text-slate-400', label: 'Pending' },
    in_progress: { icon: Circle, color: 'text-blue-500', label: 'In Progress' },
    completed: { icon: CheckCircle2, color: 'text-green-600', label: 'Completed' }
  };

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Milestone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              />
              <Input
                type="date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" type="button" onClick={() => setNewMilestone({ title: '', description: '', due_date: '' })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-3">
        {milestones.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No milestones yet</p>
        ) : (
          milestones.map((milestone) => {
            const config = statusConfig[milestone.status];
            const Icon = config.icon;
            return (
              <Card key={milestone.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => completeMutation.mutate(milestone.id)}
                      disabled={isReadOnly || milestone.status === 'completed'}
                      className="mt-1 flex-shrink-0"
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${milestone.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Due {new Date(milestone.due_date).toLocaleDateString()}
                        </Badge>
                        <Badge className="text-xs">{config.label}</Badge>
                      </div>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(milestone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}