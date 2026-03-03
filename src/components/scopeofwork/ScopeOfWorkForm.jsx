import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Loader2, FileText, DollarSign } from 'lucide-react';
import AfterPhotosUpload from '@/components/photos/AfterPhotosUpload';

export default function ScopeOfWorkForm({ open, onClose, contractor, paymentRecord }) {
  const [submitted, setSubmitted] = useState(false);
  const [costType, setCostType] = useState('fixed');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    job_title: '',
    scope_summary: '',
    cost_amount: '',
    estimated_hours: '',
    agreed_work_date: '',
  });
  const [afterPhotos, setAfterPhotos] = useState([]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const record = await base44.entities.ScopeOfWork.create(data);

      const costLine = data.cost_type === 'fixed'
        ? `Fixed Total Cost: $${data.cost_amount.toFixed(2)}`
        : `Hourly Rate: $${data.cost_amount.toFixed(2)}/hr${data.estimated_hours ? ` (Est. ${data.estimated_hours} hours = $${(data.cost_amount * data.estimated_hours).toFixed(2)} total)` : ''}`;

      const emailBody = `
Dear ${data.customer_name},

A Scope of Work has been submitted by contractor ${data.contractor_name} for your review and approval.

--- SCOPE OF WORK AGREEMENT ---

Job Title: ${data.job_title}
Contractor: ${data.contractor_name}
Customer: ${data.customer_name}

SCOPE SUMMARY:
${data.scope_summary}

AGREED COST:
${costLine}

--- IMPORTANT ---
All agreed costs, totals, and pricing described above must be approved by you before any work commences.
No work may begin and no payment is due until you have reviewed and approved this scope in full.

Please reply to confirm your approval or rejection of this scope of work.

This is an official copy of the agreement submitted through ContractorHub.
      `.trim();

      await Promise.all([
        base44.integrations.Core.SendEmail({
          to: data.customer_email,
          subject: `[Action Required] Scope of Work for "${data.job_title}" — Please Approve`,
          body: emailBody,
        }),
        base44.integrations.Core.SendEmail({
          to: data.contractor_email,
          subject: `[Copy] Scope of Work Submitted for "${data.job_title}"`,
          body: `Dear ${data.contractor_name},\n\nA copy of the scope of work you submitted to ${data.customer_name} is below.\n\n` + emailBody,
        }),
      ]);

      return record;
    },
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      contractor_email: contractor.email,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      job_title: formData.job_title,
      scope_summary: formData.scope_summary,
      cost_type: costType,
      cost_amount: Number(formData.cost_amount),
      estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : null,
      agreed_work_date: formData.agreed_work_date || null,
      after_photo_urls: afterPhotos,
      status: 'pending_approval',
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ customer_name: '', customer_email: '', job_title: '', scope_summary: '', cost_amount: '', estimated_hours: '', agreed_work_date: '' });
    setAfterPhotos([]);
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

        {!paymentRecord ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Payment Required</h3>
            <p className="text-slate-600 text-sm mb-6">
              You must pay the $1.50 platform access fee before submitting a scope of work.
            </p>
            <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Go Back & Pay Fee</Button>
          </div>
        ) : submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scope Submitted!</h3>
            <p className="text-slate-600 mb-6">
              Your scope of work has been sent to <strong>{formData.customer_name}</strong> for approval. 
              Work cannot begin until the customer approves this scope.
              Copies of this agreement have been emailed to both <strong>{formData.customer_email}</strong> and your listed email address.
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

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <p><strong>No itemized breakdowns.</strong> Only a fixed total or hourly rate is permitted.</p>
              <p>The customer must approve all agreed costs and pricing before any work begins.</p>
              <p>Upon submission, copies of this agreement will be automatically emailed to both the customer and the contractor.</p>
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