import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

export default function ExpenseForm({ scope, contractor, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    expense_type: 'materials',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileData = await file.arrayBuffer();
      const result = await base44.integrations.Core.UploadFile({
        file: new Blob([fileData], { type: file.type }),
      });
      setReceipt({ url: result.file_url, name: file.name });
    } catch (error) {
      alert('Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.JobExpense.create({
        scope_id: scope.id,
        contractor_id: contractor.id,
        contractor_email: contractor.email,
        expense_type: formData.expense_type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        receipt_url: receipt?.url || null,
        expense_date: formData.expense_date,
      });
      onSave();
    } catch (error) {
      alert('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Expense Type</label>
          <Select value={formData.expense_type} onValueChange={(v) => setFormData({ ...formData, expense_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="equipment_rental">Equipment Rental</SelectItem>
              <SelectItem value="subcontractor">Subcontractor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Date</label>
          <Input
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What was this expense for?"
          className="h-20"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Amount ($)</label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Receipt Photo (Optional)</label>
        {receipt ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-sm text-green-700">{receipt.name}</span>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-600">Click to upload receipt</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || uploading} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {saving ? 'Saving...' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}