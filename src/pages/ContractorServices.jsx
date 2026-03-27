import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'electrical', 'plumbing', 'hvac', 'carpentry', 'roofing',
  'painting', 'landscaping', 'masonry', 'welding', 'tiling',
  'general_labor', 'consulting', 'other'
];

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'quote', label: 'Quote Upon Request' }
];

export default function ContractorServices() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    category: '',
    price_type: 'fixed',
    price_amount: '',
    estimated_hours: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await base44.auth.me();
        if (me) {
          setUser(me);
          const contractors = await base44.entities.Contractor.filter({ email: me.email });
          if (contractors?.length > 0) setContractor(contractors[0]);
          else {
            navigate('/BecomeContractor');
            return;
          }
        } else {
          base44.auth.redirectToLogin();
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: services, isLoading } = useQuery({
    queryKey: ['contractorServices', contractor?.id],
    queryFn: async () => {
      if (!contractor?.email) return [];
      const results = await base44.entities.QuoteService.filter({
        contractor_email: contractor.email
      });
      return results || [];
    },
    enabled: !!contractor?.email
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QuoteService.create({
      contractor_id: contractor.id,
      contractor_email: contractor.email,
      ...data,
      price_amount: parseFloat(data.price_amount),
      estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
      is_active: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractorServices'] });
      resetForm();
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.QuoteService.update(data.id, {
      service_name: data.service_name,
      description: data.description,
      category: data.category,
      price_type: data.price_type,
      price_amount: parseFloat(data.price_amount),
      estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractorServices'] });
      resetForm();
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.QuoteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractorServices'] });
    }
  });

  const resetForm = () => {
    setFormData({
      service_name: '',
      description: '',
      category: '',
      price_type: 'fixed',
      price_amount: '',
      estimated_hours: ''
    });
    setEditingService(null);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description,
      category: service.category,
      price_type: service.price_type,
      price_amount: service.price_amount.toString(),
      estimated_hours: service.estimated_hours ? service.estimated_hours.toString() : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.service_name || !formData.description || !formData.category || !formData.price_amount) {
      return;
    }

    if (editingService) {
      await updateMutation.mutateAsync({
        id: editingService.id,
        ...formData
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  if (!user || !contractor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/ContractorQuotesManagement')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Quotes
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Services</h1>
          <p className="text-slate-600">Create and manage services for professional quotes</p>
        </div>

        {/* Add Service Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingService ? 'Edit Service' : 'Create New Service'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Service Name *</label>
                <Input
                  placeholder="e.g., Electrical Wiring Installation"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Description *</label>
                <Textarea
                  placeholder="Describe what this service includes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ').title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Price Type *</label>
                  <Select value={formData.price_type} onValueChange={(value) => setFormData({ ...formData, price_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    {formData.price_type === 'hourly' ? 'Hourly Rate ($)' : 'Price ($)'} *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price_amount}
                    onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })}
                    step="0.01"
                    min="0"
                  />
                </div>

                {formData.price_type === 'hourly' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Estimated Hours</label>
                    <Input
                      type="number"
                      placeholder="e.g., 4"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                      step="0.5"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    editingService ? 'Update Service' : 'Create Service'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Services List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : services?.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600 mb-4">No services yet. Create your first service to get started.</p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Service
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{service.service_name}</h3>
                      <Badge variant="outline">{service.category.replace(/_/g, ' ').title}</Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{service.description}</p>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-slate-500">Price Type</p>
                        <p className="font-medium text-slate-900 capitalize">{service.price_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          {service.price_type === 'hourly' ? 'Hourly Rate' : 'Price'}
                        </p>
                        <p className="font-medium text-slate-900">
                          ${service.price_amount.toFixed(2)}
                          {service.price_type === 'hourly' ? '/hr' : ''}
                        </p>
                      </div>
                      {service.estimated_hours && (
                        <div>
                          <p className="text-xs text-slate-500">Est. Hours</p>
                          <p className="font-medium text-slate-900">{service.estimated_hours}h</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}