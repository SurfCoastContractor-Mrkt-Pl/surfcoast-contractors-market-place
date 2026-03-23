import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MilestoneProgressTracker from './MilestoneProgressTracker';

export default function ProjectMilestonesManager({ scopeId, isContractor, isClient }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    fetchMilestones();
  }, [scopeId]);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ProjectMilestone.filter({ scope_id: scopeId });
      setMilestones(data || []);
    } catch (err) {
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.due_date) {
      setError('Title and due date are required');
      return;
    }

    try {
      await base44.entities.ProjectMilestone.create({
        scope_id: scopeId,
        ...formData
      });
      setFormData({ title: '', description: '', due_date: '' });
      setShowForm(false);
      fetchMilestones();
    } catch (err) {
      setError(err.message || 'Failed to create milestone');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading milestones...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Project Milestones</h3>
        {isContractor && (
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreateMilestone} className="p-4 border rounded-lg bg-slate-50 space-y-3">
          <input
            type="text"
            placeholder="Milestone title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded text-sm"
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded text-sm"
            rows="2"
          />
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full p-2 border rounded text-sm"
          />
          {error && <div className="p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" size="sm">Create</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {milestones.length === 0 ? (
        <div className="p-4 text-center text-slate-500 border rounded-lg">
          <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No milestones yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <MilestoneProgressTracker
              key={milestone.id}
              milestone={milestone}
              isContractor={isContractor}
              isClient={isClient}
            />
          ))}
        </div>
      )}
    </div>
  );
}