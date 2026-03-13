import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ChevronDown, ChevronUp, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const emptyService = {
  service_name: '',
  description: '',
  price_type: 'fixed',
  price_amount: '',
  estimated_duration: '',
};

export default function ServicePackageManager({ contractorId, services = [], onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({ ...emptyService });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceOffering.create({ ...data, contractor_id: contractorId }),
    onSuccess: () => {
      setNewService({ ...emptyService });
      setShowForm(false);
      onRefresh?.();
      queryClient.invalidateQueries({ queryKey: ['contractor-services', contractorId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceOffering.delete(id),
    onSuccess: () => {
      onRefresh?.();
      queryClient.invalidateQueries({ queryKey: ['contractor-services', contractorId] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newService.service_name || !newService.price_amount) return;
    createMutation.mutate({
      ...newService,
      price_amount: parseFloat(newService.price_amount),
    });
  };

  const priceLabel = { hourly: '/hr', fixed: ' fixed', quote: '' };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Service Packages</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1.5 text-white"
          style={{ backgroundColor: '#1E5A96' }}
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div>
            <Label className="text-sm font-medium">Service Title *</Label>
            <Input
              value={newService.service_name}
              onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
              placeholder="e.g., Full Car Service, House Clean, Logo Design"
              className="mt-1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Price Type</Label>
              <Select
                value={newService.price_type}
                onValueChange={(v) => setNewService({ ...newService, price_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="quote">Custom Quote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newService.price_type !== 'quote' && (
              <div>
                <Label className="text-sm font-medium">Amount ($)</Label>
                <Input
                  type="number"
                  value={newService.price_amount}
                  onChange={(e) => setNewService({ ...newService, price_amount: e.target.value })}
                  placeholder="e.g., 250"
                  className="mt-1"
                  min="0"
                  required
                />
              </div>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">Estimated Duration</Label>
            <Input
              value={newService.estimated_duration}
              onChange={(e) => setNewService({ ...newService, estimated_duration: e.target.value })}
              placeholder="e.g., 2-3 hours, 1 day"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Description / Scope of Work</Label>
            <Textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="Describe what's included, the process, any requirements..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createMutation.isPending} className="text-white" style={{ backgroundColor: '#1E5A96' }}>
              {createMutation.isPending ? 'Saving...' : 'Save Service'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Existing services */}
      {services.length === 0 ? (
        <p className="text-sm text-slate-500">No service packages yet. Add one to let customers know what you offer.</p>
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
              <div className="min-w-0">
                <span className="font-medium text-slate-900 text-sm">{s.service_name}</span>
                <span className="ml-2 text-xs text-slate-500">
                  {s.price_type === 'quote' ? 'Custom quote' : `$${s.price_amount}${priceLabel[s.price_type]}`}
                </span>
                {s.estimated_duration && (
                  <span className="ml-2 text-xs text-slate-400">· {s.estimated_duration}</span>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                onClick={() => deleteMutation.mutate(s.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}