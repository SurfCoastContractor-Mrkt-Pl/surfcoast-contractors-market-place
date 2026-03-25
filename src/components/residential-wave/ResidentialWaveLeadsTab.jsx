import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ResidentialWaveLeadsTab({ userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    lead_name: '',
    lead_email: '',
    lead_phone: '',
    service_type: 'electrician',
    property_address: '',
    project_description: '',
    estimated_value: '',
  });

  const queryClient = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ['residentialWaveLeads', userEmail],
    queryFn: () => base44.entities.ResidentialWaveLead.filter({ contractor_email: userEmail }),
    enabled: !!userEmail,
  });

  const createLeadMutation = useMutation({
    mutationFn: (leadData) => base44.entities.ResidentialWaveLead.create({
      ...leadData,
      contractor_email: userEmail,
      contractor_id: userEmail,
      status: 'new',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveLeads', userEmail] });
      setShowForm(false);
      setFormData({
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        service_type: 'electrician',
        property_address: '',
        project_description: '',
        estimated_value: '',
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ResidentialWaveLead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveLeads', userEmail] });
      setEditingLead(null);
      setShowForm(false);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => base44.entities.ResidentialWaveLead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentialWaveLeads', userEmail] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, data: formData });
    } else {
      createLeadMutation.mutate(formData);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData(lead);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
        <Button onClick={() => { setEditingLead(null); setShowForm(!showForm); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Lead
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Lead Name"
                value={formData.lead_name}
                onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.lead_email}
                onChange={(e) => setFormData({ ...formData, lead_email: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={formData.lead_phone}
                onChange={(e) => setFormData({ ...formData, lead_phone: e.target.value })}
              />
              <Input
                placeholder="Property Address"
                value={formData.property_address}
                onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
              />
              <Input
                placeholder="Estimated Value ($)"
                type="number"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingLead ? 'Update Lead' : 'Add Lead'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {leads && leads.length > 0 ? (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{lead.lead_name}</h3>
                    <p className="text-slate-600">{lead.lead_email}</p>
                    {lead.estimated_value && (
                      <p className="text-sm font-semibold text-slate-900 mt-2">Est. Value: ${lead.estimated_value}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded bg-slate-100 text-slate-800 capitalize">
                    {lead.status}
                  </span>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(lead)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteLeadMutation.mutate(lead.id)}>
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
            <p className="text-slate-600">No leads yet. Start building your CRM pipeline.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}