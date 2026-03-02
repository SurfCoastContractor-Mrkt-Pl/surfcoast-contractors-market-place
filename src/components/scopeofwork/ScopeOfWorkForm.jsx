import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Loader2, FileText, DollarSign } from 'lucide-react';

export default function ScopeOfWorkForm({ open, onClose, contractor }) {
  const [submitted, setSubmitted] = useState(false);
  const [costType, setCostType] = useState('fixed');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    job_title: '',
    scope_summary: '',
    cost_amount: '',
    estimated_hours: '',
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.ScopeOfWork.create(data),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      job_title: formData.job_title,
      scope_summary: formData.scope_summary,
      cost_type: costType,
      cost_amount: Number(formData.cost_amount),
      estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : null,
      status: 'pending_approval',
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ customer_name: '', customer_email: '', job_title: '', scope_summary: '', cost_amount: '', estimated_hours: '' });
    setCostType('fixed');
    onClose();
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Submit Scope of Work
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scope Submitted!</h3>
            <p className="text-slate-600 mb-6">
              Your scope of work has been sent to <strong>{formData.customer_name}</strong> for approval. 
              Work cannot begin until the customer approves this scope.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 leading-relaxed">
              <strong>Required:</strong> You must provide a detailed scope of work and either an hourly rate or a fixed total cost. 
              The customer must approve this before any work can begin.
            </div>

            {/* Customer Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Customer Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleChange('customer_email', e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleChange('job_title', e.target.value)}
                placeholder="e.g., Kitchen Electrical Rewiring"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="scope_summary">Detailed Scope of Work *</Label>
              <Textarea
                id="scope_summary"
                value={formData.scope_summary}
                onChange={(e) => handleChange('scope_summary', e.target.value)}
                placeholder="Describe in detail all work to be performed, materials needed, tasks included, and any relevant conditions or limitations..."
                required
                rows={6}
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">Be thorough — this is a binding description of the work you will perform.</p>
            </div>

            {/* Cost Type */}
            <div>
              <Label>Cost Type *</Label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCostType('fixed')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    costType === 'fixed'
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Fixed Total Cost
                </button>
                <button
                  type="button"
                  onClick={() => setCostType('hourly')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    costType === 'hourly'
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Hourly Rate
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_amount">
                  {costType === 'fixed' ? 'Fixed Total Cost ($) *' : 'Hourly Rate ($/hr) *'}
                </Label>
                <Input
                  id="cost_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost_amount}
                  onChange={(e) => handleChange('cost_amount', e.target.value)}
                  placeholder={costType === 'fixed' ? 'e.g., 2500' : 'e.g., 85'}
                  required
                  className="mt-1.5"
                />
              </div>
              {costType === 'hourly' && (
                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => handleChange('estimated_hours', e.target.value)}
                    placeholder="e.g., 20"
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <strong>No itemized breakdowns.</strong> Only a fixed total or hourly rate is permitted. 
              The customer must approve this scope before any work begins.
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  'Submit for Approval'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}