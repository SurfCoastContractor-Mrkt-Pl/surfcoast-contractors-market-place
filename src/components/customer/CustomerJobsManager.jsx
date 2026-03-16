import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Briefcase, MapPin, DollarSign, Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

function JobEditForm({ job, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: job.title || '',
    description: job.description || '',
    location: job.location || '',
    budget_min: job.budget_min || '',
    budget_max: job.budget_max || '',
    budget_type: job.budget_type || 'negotiable',
    urgency: job.urgency || 'medium',
    status: job.status || 'open',
  });

  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Job Title *</label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Kitchen Renovation" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the work needed..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Location *</label>
          <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, CA" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Budget Type</label>
          <Select value={form.budget_type} onValueChange={v => setForm(f => ({ ...f, budget_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="negotiable">Negotiable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Budget Min ($)</label>
          <Input type="number" value={form.budget_min} onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))} placeholder="500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Budget Max ($)</label>
          <Input type="number" value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} placeholder="2000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Urgency</label>
          <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" />Cancel</Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onSave(form)} disabled={!form.title || !form.description || !form.location}>
          <Check className="w-3 h-3 mr-1" />Save Changes
        </Button>
      </div>
    </div>
  );
}

export default function CustomerJobsManager({ userEmail, isAdminView = false }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['customer-jobs-manage', userEmail],
    queryFn: () => base44.entities.Job.filter({ poster_email: userEmail }, '-created_date'),
    enabled: !!userEmail,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-jobs-manage', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['customer-jobs', userEmail] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-jobs-manage', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['customer-jobs', userEmail] });
    },
  });

  const statusColor = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700',
  };

  const urgencyColor = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-10">
        <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">No job postings yet</p>
        <p className="text-xs text-slate-400 mt-1">Use the "+ Job" tab to post your first job</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{jobs.length} job posting{jobs.length !== 1 ? 's' : ''}</p>
      </div>

      {jobs.map(job => (
        <div key={job.id} className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3 p-3 bg-white">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                {job.location && (
                  <span className="flex items-center gap-0.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                )}
                {(job.budget_min || job.budget_max) && (
                  <span className="flex items-center gap-0.5 text-xs text-slate-500">
                    <DollarSign className="w-3 h-3" />
                    {job.budget_min && job.budget_max ? `$${job.budget_min?.toLocaleString()}–$${job.budget_max?.toLocaleString()}` : job.budget_min ? `from $${job.budget_min?.toLocaleString()}` : `up to $${job.budget_max?.toLocaleString()}`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge className={`text-xs ${statusColor[job.status] || 'bg-slate-100 text-slate-600'}`}>{job.status}</Badge>
              <Badge className={`text-xs ${urgencyColor[job.urgency] || 'bg-slate-100 text-slate-600'}`}>{job.urgency}</Badge>
              <button
                onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400"
              >
                {expandedId === job.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded detail + actions */}
          {expandedId === job.id && (
            <div className="border-t border-slate-200 bg-slate-50 p-3 space-y-3">
              {editingId === job.id ? (
                <JobEditForm
                  job={job}
                  onSave={(data) => updateMutation.mutate({ id: job.id, data })}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{job.description}</p>
                  <div className="text-xs text-slate-400">
                    Posted {new Date(job.created_date).toLocaleDateString()}
                    {job.start_date && ` · Start: ${new Date(job.start_date).toLocaleDateString()}`}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      onClick={() => setEditingId(job.id)}
                    >
                      <Pencil className="w-3 h-3" />Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs h-7 gap-1 border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3 h-3" />Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{job.title}". This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteMutation.mutate(job.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}