import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ServiceTemplateManager({ contractorId }) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['serviceTemplates', contractorId],
    queryFn: () => base44.entities.ServiceOffering.filter({ contractor_id: contractorId }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceOffering.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTemplates'] });
      setDialogOpen(false);
      setEditingTemplate(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceOffering.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTemplates'] });
      setDialogOpen(false);
      setEditingTemplate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceOffering.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTemplates'] });
    },
  });

  const handleSave = (formData) => {
    if (editingTemplate?.id) {
      updateMutation.mutate({ ...formData, id: editingTemplate.id });
    } else {
      createMutation.mutate({ ...formData, contractor_id: contractorId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Templates</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <TemplateForm
              template={editingTemplate}
              onSave={handleSave}
              onCancel={() => setDialogOpen(false)}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">No templates yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.data.service_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{template.data.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingTemplate(template.data);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{template.data.estimated_duration || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">
                    {template.data.price_type === 'hourly' ? '$' : ''}{template.data.price_amount}
                    {template.data.price_type === 'hourly' ? '/hr' : ''}
                  </span>
                </div>
                {template.data.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-muted-foreground text-xs mb-1">Notes & Adaptations:</p>
                    <p className="text-slate-700">{template.data.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateForm({ template, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState(
    template || {
      service_name: '',
      description: '',
      estimated_duration: '',
      price_type: 'hourly',
      price_amount: 0,
      notes: '',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{template ? 'Edit Template' : 'Create Service Template'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Service Name *</label>
          <Input
            value={formData.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
            placeholder="e.g., Toilet Replacement"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the work"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Estimated Duration</label>
          <Input
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
            placeholder="e.g., 2-4 hours"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Price Type *</label>
            <select
              value={formData.price_type}
              onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Price Amount *</label>
            <Input
              type="number"
              value={formData.price_amount}
              onChange={(e) => setFormData({ ...formData, price_amount: parseFloat(e.target.value) })}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notes & Adaptations</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Document the process, potential issues, and contingencies..."
            className="h-28"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button disabled={isLoading}>
            {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </>
  );
}