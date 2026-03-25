import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ResidentialWaveJobsTab({ userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_address: '',
    service_type: 'electrician',
    estimated_hours: '',
    quote_amount: '',
  });

  const queryClient = useQueryClient();

  const { data: jobs } = useQuery({
    queryKey: ['residentialWaveJobs', userEmail],
    queryFn: () => base44.entities.ResidentialWaveJob.filter({ contractor_email: userEmail }),
    enabled: !!userEmail,
  });

  const createJobMutation = useMutation({
    mutationFn: (jobData) => base44.entities.ResidentialWaveJob.create({
      ...jobData,
      contractor_email: userEmail,
      contractor_id: userEmail,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveJobs', userEmail] });
      setShowForm(false);
      setFormData({
        title: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_address: '',
        service_type: 'electrician',
        estimated_hours: '',
        quote_amount: '',
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ResidentialWaveJob.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveJobs', userEmail] });
      setEditingJob(null);
      setShowForm(false);
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.ResidentialWaveJob.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveJobs', userEmail] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: formData });
    } else {
      createJobMutation.mutate(formData);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData(job);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Jobs</h2>
        <Button onClick={() => { setEditingJob(null); setShowForm(!showForm); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
              <Input
                placeholder="Customer Email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              />
              <Input
                placeholder="Service Address"
                value={formData.service_address}
                onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
              />
              <Input
                placeholder="Estimated Hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
              />
              <Input
                placeholder="Quote Amount ($)"
                type="number"
                value={formData.quote_amount}
                onChange={(e) => setFormData({ ...formData, quote_amount: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {jobs && jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{job.title}</h3>
                    <p className="text-slate-600">{job.customer_name}</p>
                    <p className="text-sm text-slate-500 mt-1">{job.service_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${job.quote_amount || 0}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded mt-2 inline-block ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                {job.scheduled_date && (
                  <p className="text-sm text-slate-600 mb-4">📅 {job.scheduled_date}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(job)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteJobMutation.mutate(job.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600">No jobs yet. Create your first job to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}