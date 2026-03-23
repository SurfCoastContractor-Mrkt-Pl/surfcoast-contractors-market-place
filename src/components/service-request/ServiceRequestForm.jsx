import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, Upload, X, Send } from 'lucide-react';

const BUDGET_RANGES = [
  { value: 'under_500', label: 'Under $500' },
  { value: '500_1000', label: '$500 – $1,000' },
  { value: '1000_5000', label: '$1,000 – $5,000' },
  { value: '5000_10000', label: '$5,000 – $10,000' },
  { value: '10000_plus', label: '$10,000+' },
  { value: 'not_sure', label: 'Not sure yet' },
];

const TIMELINES = [
  { value: 'urgent', label: 'Urgent – within 1 week' },
  { value: 'soon', label: 'Soon – 1 to 2 weeks' },
  { value: 'flexible', label: 'Flexible – 2 to 4 weeks' },
  { value: 'no_rush', label: 'No rush – 1+ months' },
];

export default function ServiceRequestForm({ isOpen, onClose, professional }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    projectTitle: '',
    description: '',
    budget: '',
    timeline: '',
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isContractor = professional?.type === 'contractor';
  const proName = isContractor ? professional.name : professional?.shop_name;
  const proEmail = professional?.email;

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setPhotos(prev => [...prev, file_url]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const canSubmit = form.name && form.email && form.projectTitle && form.description;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const budgetLabel = BUDGET_RANGES.find(b => b.value === form.budget)?.label || 'Not specified';
      const timelineLabel = TIMELINES.find(t => t.value === form.timeline)?.label || 'Not specified';

      const photoSection = photos.length > 0
        ? `\n\nAttached Photos (${photos.length}):\n${photos.map((url, i) => `  ${i + 1}. ${url}`).join('\n')}`
        : '';

      await base44.integrations.Core.SendEmail({
        to: proEmail,
        from_name: 'SurfCoast Marketplace',
        subject: `New Service Request from ${form.name} — ${form.projectTitle}`,
        body: `You have received a new service request through SurfCoast Marketplace.

FROM:
  Name: ${form.name}
  Email: ${form.email}
  Phone: ${form.phone || 'Not provided'}

PROJECT DETAILS:
  Title: ${form.projectTitle}
  Description: ${form.description}
  Budget Range: ${budgetLabel}
  Timeline: ${timelineLabel}${photoSection}

---
Please reply directly to ${form.email} to discuss this project.
Log in to your SurfCoast dashboard for more options.`,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to send service request:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setForm({ name: '', email: '', phone: '', projectTitle: '', description: '', budget: '', timeline: '' });
      setPhotos([]);
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <SuccessState proName={proName} onClose={handleClose} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Request Service from {proName}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                Fill out the details below and {proName} will receive an email notification.
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sr-name">Full Name *</Label>
                  <Input id="sr-name" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sr-email">Email *</Label>
                  <Input id="sr-email" type="email" placeholder="you@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="sr-phone">Phone (optional)</Label>
                <Input id="sr-phone" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>

              {/* Project Details */}
              <div>
                <Label htmlFor="sr-title">Project Title *</Label>
                <Input id="sr-title" placeholder="e.g., Kitchen Remodel, Booth Inquiry" value={form.projectTitle} onChange={e => update('projectTitle', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sr-desc">Project Description *</Label>
                <Textarea id="sr-desc" placeholder="Describe what you need in detail…" rows={4} value={form.description} onChange={e => update('description', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Budget Range</Label>
                  <Select value={form.budget} onValueChange={v => update('budget', v)}>
                    <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timeline</Label>
                  <Select value={form.timeline} onValueChange={v => update('timeline', v)}>
                    <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Photos (optional)</Label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors mt-1">
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-blue-500" /><span className="text-sm text-blue-600">Uploading…</span></>
                  ) : (
                    <><Upload className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-500">Click to upload project photos</span></>
                  )}
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
                </label>
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {photos.map((url, i) => (
                      <div key={i} className="relative group w-16 h-16">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-md" />
                        <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />Send Service Request</>
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center">
                By submitting, you agree to share your contact information with {proName}.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessState({ proName, onClose }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h2>
      <p className="text-slate-600 mb-6 max-w-sm">
        Your service request has been sent to <strong>{proName}</strong>. They'll receive an email with your project details and will reach out to discuss next steps.
      </p>
      <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
        Done
      </Button>
    </div>
  );
}