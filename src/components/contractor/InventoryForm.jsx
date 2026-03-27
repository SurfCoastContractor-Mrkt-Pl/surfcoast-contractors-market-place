import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InventoryForm({ contractor, onSave, onCancel, initialData = null }) {
  const [formData, setFormData] = useState(initialData || {
    material_name: '',
    category: 'other',
    unit: 'piece',
    current_quantity: '',
    low_stock_threshold: '5',
    unit_cost: '',
    supplier: '',
    last_restocked_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material_name.trim() || !formData.unit.trim()) {
      alert('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        contractor_id: contractor.id,
        contractor_email: contractor.email,
        material_name: formData.material_name,
        category: formData.category,
        unit: formData.unit,
        current_quantity: parseFloat(formData.current_quantity) || 0,
        low_stock_threshold: parseFloat(formData.low_stock_threshold) || 5,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        supplier: formData.supplier || null,
        last_restocked_date: formData.last_restocked_date,
      };

      if (initialData?.id) {
        await base44.entities.ContractorInventory.update(initialData.id, payload);
      } else {
        await base44.entities.ContractorInventory.create(payload);
      }
      onSave();
    } catch (error) {
      alert('Failed to save inventory item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Material Name *</label>
          <Input
            value={formData.material_name}
            onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
            placeholder="e.g., PVC Pipe 1-inch"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="carpentry">Carpentry</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="fasteners">Fasteners</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Unit *</label>
          <Input
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="piece, ft, lb, roll, box, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Current Quantity</label>
          <Input
            type="number"
            step="0.1"
            value={formData.current_quantity}
            onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Low Stock Threshold</label>
          <Input
            type="number"
            step="0.1"
            value={formData.low_stock_threshold}
            onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Unit Cost ($)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.unit_cost}
            onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Supplier</label>
          <Input
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="e.g., Home Depot, Local Supply Co"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Last Restocked</label>
          <Input
            type="date"
            value={formData.last_restocked_date}
            onChange={(e) => setFormData({ ...formData, last_restocked_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {saving ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}