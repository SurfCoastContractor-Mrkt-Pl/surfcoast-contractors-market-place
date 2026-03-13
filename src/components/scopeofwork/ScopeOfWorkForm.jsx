import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Loader2, FileText, DollarSign } from 'lucide-react';
import AfterPhotosUpload from '@/components/photos/AfterPhotosUpload';
import TradeSpecificGuidance from '@/components/legal/TradeSpecificGuidance';

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
      // Verify authenticated contractor
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          throw new Error('You must be logged in to submit a scope of work');
        }
      } catch (err) {
        throw err;
      }
      const record = await base44.entities.ScopeOfWork.create(data);

      const costLine = data.cost_type === 'fixed'
        ? `Fixed Total Cost: $${data.cost_amount.toFixed(2)}`
        : `Hourly Rate: $${data.cost_amount.toFixed(2)}/hr${data.estimated_hours ? ` (Est. ${data.estimated_hours} hours = $${(data.cost_amount * data.estimated_hours).toFixed(2)} total)` : ''}`;

      const workDateLine = data.agreed_work_date
        ? `Agreed Work Date: ${new Date(data.agreed_work_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
        : '';
      const afterPhotoDeadline = data.agreed_work_date
        ? `After Photo Deadline: ${new Date(new Date(data.agreed_work_date).getTime() + 72 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (72 hours after work date)`
        : '';

      // Notify contractor when customer approves (will be handled separately)
      
      const emailBody = `
Dear ${data.customer_name},

A Scope of Work has been submitted by contractor ${data.contractor_name} for your review and approval.

--- SCOPE OF WORK AGREEMENT ---

Job Title: ${data.job_title}
Contractor: ${data.contractor_name}
Customer: ${data.customer_name}
${workDateLine ? workDateLine + '\n' : ''}
SCOPE SUMMARY:
${data.scope_summary}

AGREED COST:
${costLine}
${afterPhotoDeadline ? '\nAFTER PHOTOS:\n' + afterPhotoDeadline + '\nThe contractor is required to upload after photos within 72 hours of the agreed work date as a completion record.\n' : ''}
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
          <DialogDescription>
            Submit a detailed scope of work for customer review and approval.
          </DialogDescription>
        </DialogHeader>

        {!paymentRecord || paymentRecord.status !== 'confirmed' ? (
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
             <TradeSpecificGuidance 
               tradeType={contractor?.line_of_work || contractor?.trade_specialty}
               location={contractor?.location}
               showAsCard={true}
             />

             <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 leading-relaxed">
               <strong>Note:</strong> Providing a detailed scope of work and clear pricing helps ensure both you and the customer have a shared understanding before work begins.
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
                minLength="5"
                required
                className="mt-1.5"
              />
              {formData.job_title && formData.job_title.length < 5 && (
                <p className="text-xs text-red-600 mt-1">Job title must be at least 5 characters</p>
              )}
            </div>

            <div>
              <Label htmlFor="scope_summary">Detailed Scope of Work *</Label>
              <p className="text-xs text-slate-600 mb-2">
                <strong>Scope of Work:</strong> All the work you will perform and may do to complete the project. Include tasks, materials you'll provide, what's not included, and any key assumptions.
              </p>
              <Textarea
                id="scope_summary"
                value={formData.scope_summary}
                onChange={(e) => handleChange('scope_summary', e.target.value)}
                placeholder="Describe in detail all work to be performed, materials needed, tasks included, and any relevant conditions or limitations..."
                required
                minLength="20"
                rows={6}
                className="mt-1.5"
              />
              {formData.scope_summary && formData.scope_summary.length < 20 && (
                <p className="text-xs text-red-600 mt-1">Scope must be at least 20 characters</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Be thorough — define everything you will and won't do so the customer knows exactly what to expect.</p>
            </div>

            {/* Cost Type */}
             <div>
               <Label>Cost Type *</Label>
               <div className="flex gap-3 mt-2 flex-wrap">
                 <button
                   type="button"
                   onClick={() => setCostType('fixed')}
                   className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                     costType === 'fixed'
                       ? 'border-amber-500 bg-amber-50 text-amber-800'
                       : 'border-slate-200 text-slate-600 hover:border-slate-300'
                   }`}
                 >
                   <DollarSign className="w-4 h-4" />
                   Fixed Total
                 </button>
                 <button
                   type="button"
                   onClick={() => setCostType('hourly')}
                   className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                     costType === 'hourly'
                       ? 'border-amber-500 bg-amber-50 text-amber-800'
                       : 'border-slate-200 text-slate-600 hover:border-slate-300'
                   }`}
                 >
                   <DollarSign className="w-4 h-4" />
                   Hourly Rate
                 </button>
                 <button
                   type="button"
                   onClick={() => setCostType('quote')}
                   className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                     costType === 'quote'
                       ? 'border-amber-500 bg-amber-50 text-amber-800'
                       : 'border-slate-200 text-slate-600 hover:border-slate-300'
                   }`}
                 >
                   <DollarSign className="w-4 h-4" />
                   Quote
                 </button>
               </div>
             </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_amount">
                    {costType === 'fixed' ? 'Fixed Total Cost ($) *' : costType === 'hourly' ? 'Hourly Rate ($/hr) *' : 'Estimated Quote ($) *'}
                  </Label>
                <Input
                  id="cost_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.cost_amount}
                  onChange={(e) => handleChange('cost_amount', e.target.value)}
                  placeholder={costType === 'fixed' ? 'e.g., 2500' : 'e.g., 85'}
                  required
                  className="mt-1.5"
                />
                {formData.cost_amount && Number(formData.cost_amount) <= 0 && (
                  <p className="text-xs text-red-600 mt-1">Cost must be greater than $0</p>
                )}
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

            {/* Agreed Work Date */}
            <div>
              <Label htmlFor="agreed_work_date">Agreed Work Date</Label>
              <Input
                id="agreed_work_date"
                type="date"
                value={formData.agreed_work_date}
                onChange={(e) => handleChange('agreed_work_date', e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">
                The date you've agreed on for the work. After photos help document completion.
              </p>
            </div>

            {/* After Photos */}
            <div>
              <Label className="text-sm font-semibold text-slate-800 mb-2 block">After Photos (Mandatory from Contractor)</Label>
              <AfterPhotosUpload
                photos={afterPhotos}
                onChange={setAfterPhotos}
                agreedWorkDate={formData.agreed_work_date}
              />
              <p className="text-xs text-slate-500 mt-1">
                After photos help document the completed work. They can be added now or updated later.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <p>Clear pricing—either a fixed total or hourly rate—helps both parties understand the agreement.</p>
              <p>The customer will receive a copy of this scope for review. Copies will be emailed to both parties.</p>
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