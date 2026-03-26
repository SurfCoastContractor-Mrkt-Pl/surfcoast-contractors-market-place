import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X, AlertTriangle } from 'lucide-react';
import LineOfWorkSelector from '@/components/contractor/LineOfWorkSelector';

export default function OnboardingStep2Professional({
  formData,
  onFieldChange,
}) {
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      onFieldChange('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (idx) => {
    onFieldChange('skills', formData.skills.filter((_, i) => i !== idx));
  };

  const addCertification = () => {
    if (newCert.trim()) {
      onFieldChange('certifications', [...formData.certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCertification = (idx) => {
    onFieldChange('certifications', formData.certifications.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Professional Details</h2>
      
      <div className="space-y-6">
        <div>
          <LineOfWorkSelector
            value={formData.line_of_work}
            customValue={formData.line_of_work_other}
            onChange={(v) => onFieldChange('line_of_work', v)}
            onCustomChange={(v) => onFieldChange('line_of_work_other', v)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="years_experience">Years of Experience</Label>
            <Input
              id="years_experience"
              type="number"
              value={formData.years_experience}
              onChange={(e) => onFieldChange('years_experience', e.target.value)}
              placeholder="e.g., 10"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="rate_type">Rate Type</Label>
            <Select value={formData.rate_type} onValueChange={(v) => onFieldChange('rate_type', v)}>
              <SelectTrigger id="rate_type" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.rate_type === 'hourly' && (
          <div>
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => onFieldChange('hourly_rate', e.target.value)}
              placeholder="e.g., 75"
              className="mt-1.5"
            />
          </div>
        )}

        {formData.rate_type === 'fixed' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="fixed_rate">Fixed Rate ($)</Label>
              <Input
                id="fixed_rate"
                type="number"
                value={formData.fixed_rate}
                onChange={(e) => onFieldChange('fixed_rate', e.target.value)}
                placeholder="e.g., 500"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="fixed_rate_details">Fixed Rate Details</Label>
              <Textarea
                id="fixed_rate_details"
                value={formData.fixed_rate_details}
                onChange={(e) => onFieldChange('fixed_rate_details', e.target.value)}
                placeholder="Describe what your fixed rate covers..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="bio">About You</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => onFieldChange('bio', e.target.value)}
            placeholder="Tell potential clients about your experience, specialties, and what makes you stand out..."
            rows={4}
            className="mt-1.5"
          />
          <p className="text-xs text-slate-500 mt-1">Optional</p>
        </div>

        <div>
          <Label>Skills & Types of Work You Can Do</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g., Kitchen Remodeling, Tile Work"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(idx)} className="hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">Optional</p>
        </div>

        <div>
          <Label>Certifications & Licenses</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="e.g., Licensed Electrician"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            />
            <Button type="button" onClick={addCertification} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.certifications.map((cert, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm">
                  {cert}
                  <button type="button" onClick={() => removeCertification(idx)} className="hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {formData.certifications.some(c => /licen/i.test(c)) && (
            <div className="mt-3 p-4 rounded-xl border-2 border-amber-300 bg-amber-50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Trade License — Verification Hold</p>
                <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
                  Your profile will be placed on hold pending admin review (1–3 business days).
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <Label className="text-base">Available for Work</Label>
            <p className="text-sm text-slate-500">Show clients you're ready to take on projects</p>
          </div>
          <Switch
            checked={formData.available}
            onCheckedChange={(v) => onFieldChange('available', v)}
          />
        </div>
      </div>
    </div>
  );
}