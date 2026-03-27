import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function ProjectTaskManager({ scopeId, contractorEmail, tierLevel }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ task_title: '', priority: 'medium', status: 'todo' });

  useEffect(() => {
    fetchTasks();
  }, [scopeId]);

  const fetchTasks = async () => {
    try {
      const data = await base44.entities.ProjectTask.filter({ scope_id: scopeId });
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.task_title) return;
    try {
      await base44.entities.ProjectTask.create({
        scope_id: scopeId,
        contractor_email: contractorEmail,
        ...form
      });
      fetchTasks();
      setForm({ task_title: '', priority: 'medium', status: 'todo' });
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await base44.entities.ProjectTask.update(task.id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.ProjectTask.delete(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (tierLevel === 'starter') {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Project Tasks <Lock className="w-4 h-4 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Upgrade to Wave Pro to create and manage project tasks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Tasks</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(!formOpen)}>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <Input
              placeholder="Task title"
              value={form.task_title}
              onChange={(e) => setForm({ ...form, task_title: e.target.value })}
            />
            <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 flex-1">
                <button onClick={() => handleStatusChange(task, task.status === 'completed' ? 'todo' : 'completed')}>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <div>
                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                    {task.task_title}
                  </h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{task.priority}</span>
                    {task.due_date && <span className="text-xs text-slate-500">{task.due_date}</span>}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && !formOpen && (
          <p className="text-sm text-slate-500 text-center py-4">No tasks yet.</p>
        )}
      </CardContent>
    </Card>
  );
}