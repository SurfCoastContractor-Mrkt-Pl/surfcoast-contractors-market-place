import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';

const DISPUTE_CATEGORIES = [
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'work_quality', label: 'Work Quality' },
  { value: 'timeline_delay', label: 'Timeline Delay' },
  { value: 'communication_problem', label: 'Communication Problem' },
  { value: 'contract_breach', label: 'Contract Breach' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function DisputeInitiationForm({ scope, user, onDisputeCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    severity: 'medium',
  });
  const [evidence, setEvidence] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isContractor = scope.contractor_email === user?.email;
  const respondentEmail = isContractor ? scope.customer_email : scope.contractor_email;
  const respondentName = isContractor ? scope.customer_name : scope.contractor_name;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setEvidence(prev => [...prev, file_url]);
      }
    } catch (err) {
      setError('Failed to upload evidence. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeEvidence = (idx) => {
    setEvidence(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Dispute.create({
        initiator_email: user.email,
        initiator_name: user.full_name,
        initiator_type: isContractor ? 'contractor' : 'customer',
        respondent_email: respondentEmail,
        respondent_name: respondentName,
        respondent_type: isContractor ? 'customer' : 'contractor',
        scope_id: scope.id,
        job_id: scope.job_id,
        job_title: scope.job_title,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        evidence_urls: evidence,
        status: 'open',
        submitted_at: new Date().toISOString(),
      });

      setFormData({ title: '', description: '', category: 'other', severity: 'medium' });
      setEvidence([]);
      onDisputeCreated();
    } catch (err) {
      setError('Failed to create dispute. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
      <h2 className="text-xl font-semibold text-white mb-6">Open a Dispute</h2>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }} className="text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Dispute Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of the issue"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', width: '100%' }}
            className="text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide detailed information about the dispute"
            rows={5}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', width: '100%', fontFamily: 'inherit' }}
            className="text-sm resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', width: '100%' }}
            className="text-sm"
          >
            {DISPUTE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value} style={{ background: '#1a1a1a', color: '#fff' }}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Severity Level *</label>
          <div className="flex gap-2">
            {SEVERITY_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                style={{
                  background: formData.severity === level.value ? '#1d6fa4' : 'rgba(255,255,255,0.05)',
                  border: formData.severity === level.value ? '1px solid #1d6fa4' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1,
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Evidence (Images/Documents)</label>
          <div
            style={{ background: 'rgba(59,130,246,0.1)', border: '2px dashed rgba(59,130,246,0.5)', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload({ target: { files: e.dataTransfer.files } });
            }}
          >
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(59,130,246,0.7)' }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '4px' }}>
                Drag & drop files or <span style={{ color: '#3b82f6' }}>click to upload</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>PNG, JPG, PDF up to 10MB</p>
              <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Evidence List */}
          {evidence.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-white font-medium">{evidence.length} file(s) attached</p>
              {evidence.map((url, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="text-sm text-white truncate">{url.split('/').pop()}</p>
                  <button type="button" onClick={() => removeEvidence(idx)} className="text-red-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting || uploading}
            style={{ background: '#1d6fa4', color: '#fff', padding: '10px 20px', fontWeight: '600', flex: 1 }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Dispute'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}