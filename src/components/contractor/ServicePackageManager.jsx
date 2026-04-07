import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ServicePackageManager({ contractorId, contractorEmail }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);

  const { data: packages = [] } = useQuery({
    queryKey: ['servicePackages', contractorEmail],
    queryFn: () =>
      base44.entities.ServicePackage.filter({
        contractor_email: contractorEmail
      })
  });

  const createMutation = useMutation({
    mutationFn: (pkg) =>
      base44.entities.ServicePackage.create({
        ...pkg,
        contractor_id: contractorId,
        contractor_email: contractorEmail
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicePackages', contractorEmail] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...pkg }) =>
      base44.entities.ServicePackage.update(id, pkg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicePackages', contractorEmail] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.ServicePackage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicePackages', contractorEmail] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData(null);
    setEditingId(null);
  };

  const startEdit = (pkg) => {
    setEditingId(pkg.id);
    setFormData(pkg);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-6">
            Create standardized service offerings that clients can book directly.
          </p>

          {/* Form */}
          {formData && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg mb-6 space-y-4">
              <input
                type="text"
                placeholder="Package Name"
                value={formData.package_name || ''}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.pricing_model || 'fixed'}
                  onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly</option>
                  <option value="tiered">Tiered</option>
                </select>
                <input
                  type="number"
                  placeholder="Base Price"
                  value={formData.base_price || ''}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Estimated Duration (e.g., 2-4 hours)"
                value={formData.estimated_duration || ''}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Update' : 'Create'} Package
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {!formData && (
            <Button
              onClick={() => setFormData({
                package_name: '',
                description: '',
                pricing_model: 'fixed',
                base_price: 0,
                estimated_duration: ''
              })}
              className="mb-6 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Package
            </Button>
          )}

          {/* Package List */}
          <div className="space-y-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{pkg.package_name}</h4>
                      {pkg.is_featured && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{pkg.description}</p>
                    <p className="text-sm text-slate-500">
                      <strong>${pkg.base_price}</strong> • {pkg.estimated_duration}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(pkg)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(pkg.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}