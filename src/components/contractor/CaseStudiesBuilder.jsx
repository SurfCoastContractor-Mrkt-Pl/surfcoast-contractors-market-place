import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Upload, X, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TRADE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumbing' },
  { value: 'carpenter', label: 'Carpentry' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'painter', label: 'Painting' },
  { value: 'roofer', label: 'Roofing' },
  { value: 'landscaper', label: 'Landscaping' },
  { value: 'mason', label: 'Masonry' },
  { value: 'welder', label: 'Welding' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = {
  title: '',
  trade_category: 'general',
  client_background: '',
  challenge: '',
  solution: '',
  results: '',
  client_testimonial: '',
  project_duration: '',
  project_value: '',
  completion_date: '',
  is_public: true,
};

function CaseStudyForm({ initial, onSave, onCancel, isPending, contractorEmail }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx('uploading');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('image_urls', [...(form.image_urls || []), file_url]);
    setUploadingIdx(null);
  };

  const removeImage = (idx) => {
    set('image_urls', (form.image_urls || []).filter((_, i) => i !== idx));
  };

  const isValid = form.title && form.challenge && form.solution && form.results;

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Project Title *</label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Complete Kitchen Renovation" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Trade / Category</label>
          <select value={form.trade_category} onChange={e => set('trade_category', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
            {TRADE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Completion Date</label>
          <Input type="date" value={form.completion_date} onChange={e => set('completion_date', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Project Duration</label>
          <Input value={form.project_duration} onChange={e => set('project_duration', e.target.value)} placeholder="e.g., 3 days" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Project Value (optional)</label>
          <Input value={form.project_value} onChange={e => set('project_value', e.target.value)} placeholder="e.g., $5,000–$8,000" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">Client Background (optional)</label>
        <Textarea value={form.client_background} onChange={e => set('client_background', e.target.value)}
          placeholder="Brief context about the client or property..." rows={2} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">The Challenge *</label>
        <Textarea value={form.challenge} onChange={e => set('challenge', e.target.value)}
          placeholder="Describe the problem or challenge the client faced..." rows={3} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">Your Solution *</label>
        <Textarea value={form.solution} onChange={e => set('solution', e.target.value)}
          placeholder="Explain how you approached and solved the problem..." rows={3} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">Results & Outcomes *</label>
        <Textarea value={form.results} onChange={e => set('results', e.target.value)}
          placeholder="Describe measurable results, timeline met, satisfaction..." rows={3} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">Client Testimonial (optional)</label>
        <Textarea value={form.client_testimonial} onChange={e => set('client_testimonial', e.target.value)}
          placeholder='"Direct quote from the client..." — Client Name' rows={2} />
      </div>

      {/* Photos */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Before / After Photos (optional)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(form.image_urls || []).map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
              <button onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            {uploadingIdx === 'uploading' ? (
              <span className="text-xs text-slate-500">...</span>
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-400 mt-1">Add</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingIdx === 'uploading'} />
          </label>
        </div>
      </div>

      {/* Public toggle */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          {form.is_public ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          <span className="text-sm font-medium text-slate-700">
            {form.is_public ? 'Visible on public profile' : 'Hidden from public'}
          </span>
        </div>
        <Switch checked={form.is_public} onCheckedChange={val => set('is_public', val)} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!isValid || isPending}
          className="flex-1 text-white" style={{ backgroundColor: '#1E5A96' }}>
          {isPending ? 'Saving...' : 'Save Case Study'}
        </Button>
      </div>
    </div>
  );
}

function CaseStudyCard({ study, onEdit, onDelete, onToggleVisibility }) {
  const [expanded, setExpanded] = useState(false);

  const tradeLabel = TRADE_OPTIONS.find(o => o.value === study.trade_category)?.label || study.trade_category;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl shrink-0">📊</div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{study.title}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant="outline" className="text-xs">{tradeLabel}</Badge>
              {study.project_duration && <span className="text-xs text-slate-500">⏱ {study.project_duration}</span>}
              {study.completion_date && <span className="text-xs text-slate-500">📅 {new Date(study.completion_date).toLocaleDateString()}</span>}
              {!study.is_public && <Badge className="bg-slate-100 text-slate-500 text-xs gap-1"><EyeOff className="w-3 h-3" />Hidden</Badge>}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="p-4 bg-white border-t border-slate-100 space-y-4">
          {study.client_background && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Client Background</div>
              <p className="text-sm text-slate-700">{study.client_background}</p>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">⚡ The Challenge</div>
            <p className="text-sm text-slate-700">{study.challenge}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">🔧 Our Solution</div>
            <p className="text-sm text-slate-700">{study.solution}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">✅ Results</div>
            <p className="text-sm text-slate-700">{study.results}</p>
          </div>
          {study.client_testimonial && (
            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <p className="text-sm italic text-slate-700">"{study.client_testimonial}"</p>
            </div>
          )}
          {study.project_value && (
            <div className="text-xs text-slate-500">💰 Project value: {study.project_value}</div>
          )}

          {/* Photos */}
          {(study.image_urls || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {study.image_urls.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => onEdit(study)}>
              <Edit2 className="w-3 h-3" />Edit
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1"
              onClick={() => onToggleVisibility(study)}>
              {study.is_public ? <><EyeOff className="w-3 h-3" />Hide</> : <><Eye className="w-3 h-3" />Show</>}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1 text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Case Study</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(study.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaseStudiesBuilder({ contractorId, contractorEmail }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: caseStudies = [] } = useQuery({
    queryKey: ['case-studies', contractorId],
    queryFn: () => base44.entities.CaseStudy.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CaseStudy.create({ ...data, contractor_id: contractorId, contractor_email: contractorEmail }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['case-studies', contractorId] }); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CaseStudy.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['case-studies', contractorId] }); setEditing(null); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaseStudy.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-studies', contractorId] }),
  });

  const handleSave = (form) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (study) => {
    setEditing(study);
    setDialogOpen(true);
  };

  const handleToggleVisibility = (study) => {
    updateMutation.mutate({ id: study.id, data: { is_public: !study.is_public } });
  };

  const publicCount = caseStudies.filter(s => s.is_public).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Case Studies</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showcase real projects — {publicCount} of {caseStudies.length} visible on your public profile
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-white" style={{ backgroundColor: '#1E5A96' }}>
              <Plus className="w-4 h-4" />New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Case Study' : 'New Case Study'}</DialogTitle>
            </DialogHeader>
            <CaseStudyForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => { setDialogOpen(false); setEditing(null); }}
              isPending={createMutation.isPending || updateMutation.isPending}
              contractorEmail={contractorEmail}
            />
          </DialogContent>
        </Dialog>
      </div>

      {caseStudies.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No case studies yet</p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            Case studies show potential clients real examples of your work — including the challenge, your solution, and the results.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {caseStudies.map(study => (
            <CaseStudyCard
              key={study.id}
              study={study}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Pro Tip:</strong> Include specific metrics ("completed 2 weeks early", "saved client $2,000"), before/after photos, and client quotes to build trust with potential clients.
        </p>
      </div>
    </Card>
  );
}