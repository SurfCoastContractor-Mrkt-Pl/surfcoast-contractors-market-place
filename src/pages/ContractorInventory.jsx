import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';

export default function ContractorInventory() {
  const [user, setUser] = React.useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'power_tools',
    quantity: 1,
    reorder_level: 0,
    description: '',
    supplier: '',
    supplier_contact: ''
  });
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment', user?.email],
    queryFn: () => user?.email ? base44.entities.Equipment.filter({ contractor_email: user.email }) : [],
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create({
      ...data,
      contractor_id: user.id,
      contractor_email: user.email,
      quantity: parseInt(data.quantity)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Equipment.update(id, {
      ...data,
      quantity: parseInt(data.quantity)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Equipment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  const handleSubmit = async () => {
    if (!formData.name) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      reorder_level: item.reorder_level || 0,
      description: item.description || '',
      supplier: item.supplier || '',
      supplier_contact: item.supplier_contact || ''
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'power_tools',
      quantity: 1,
      reorder_level: 0,
      description: '',
      supplier: '',
      supplier_contact: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const lowStockItems = equipment.filter(item => 
    item.reorder_level && item.quantity <= item.reorder_level
  );

  const categories = {
    power_tools: 'Power Tools',
    hand_tools: 'Hand Tools',
    safety_equipment: 'Safety Equipment',
    heavy_machinery: 'Heavy Machinery',
    specialty_tools: 'Specialty Tools',
    other: 'Other'
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Equipment & Inventory</h1>
          <p className="text-slate-600 mt-2">Track your tools and equipment. Set reorder levels for automatic low-stock alerts.</p>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">{lowStockItems.length} items below reorder level</p>
                <p className="text-sm text-orange-800 mt-1">
                  {lowStockItems.map(item => item.name).join(', ')} need restocking
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Equipment Button */}
        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Equipment
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Equipment' : 'Add New Equipment'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Equipment Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Reorder Level (low-stock alert threshold)"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="Supplier Name"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
              <Input
                placeholder="Supplier Contact"
                value={formData.supplier_contact}
                onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingId ? 'Update' : 'Add'} Equipment
                </Button>
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment List */}
        {equipment.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">
              No equipment yet. Add your first tool to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map(item => (
              <Card key={item.id} className={item.quantity <= (item.reorder_level || 0) ? 'border-orange-200 bg-orange-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant="outline" className="mt-2">{categories[item.category]}</Badge>
                    </div>
                    {item.quantity <= (item.reorder_level || 0) && (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-slate-600">{item.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-600">Quantity</p>
                      <p className="font-semibold text-slate-900">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Reorder Level</p>
                      <p className="font-semibold text-slate-900">{item.reorder_level || 'Not set'}</p>
                    </div>
                  </div>
                  {item.supplier && (
                    <div className="text-sm">
                      <p className="text-slate-600">Supplier</p>
                      <p className="text-slate-900">{item.supplier}</p>
                      {item.supplier_contact && <p className="text-slate-600">{item.supplier_contact}</p>}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEdit(item)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteMutation.mutate(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 flex-1 gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}