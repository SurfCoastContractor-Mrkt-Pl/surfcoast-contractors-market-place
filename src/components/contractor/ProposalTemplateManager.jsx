import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Copy, Eye, Trash2, Edit2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PROPOSAL_SECTIONS = [
  { id: 'overview', label: 'Project Overview' },
  { id: 'scope', label: 'Scope of Work' },
  { id: 'timeline', label: 'Timeline & Schedule' },
  { id: 'pricing', label: 'Pricing & Payment' },
  { id: 'terms', label: 'Terms & Conditions' },
];

export default function ProposalTemplateManager({ contractorId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    overview: '',
    scope: '',
    timeline: '',
    pricing: '',
    terms: '',
  });

  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['proposal-templates', contractorId],
    queryFn: async () => {
      const results = await base44.entities.DocumentTemplate.filter({ contractor_id: contractorId, template_type: 'proposal' });
      return results;
    },
    enabled: !!contractorId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const content = JSON.stringify({
        overview: data.overview,
        scope: data.scope,
        timeline: data.timeline,
        pricing: data.pricing,
        terms: data.terms,
      });
      return base44.entities.DocumentTemplate.create({
        contractor_id: contractorId,
        contractor_email: '', // will be filled by RLS from user session
        template_type: 'proposal',
        template_name: data.name,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates', contractorId] });
      resetForm();
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.DocumentTemplate.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates', contractorId] });
    },
  });

  const handleSubmit = () => {
    if (formData.name) {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      overview: '',
      scope: '',
      timeline: '',
      pricing: '',
      terms: '',
    });
  };

  const parseContent = (template) => {
    try { return JSON.parse(template.content || '{}'); } catch { return {}; }
  };

  const handleCopyTemplate = (template) => {
    const sections = parseContent(template);
    const text = `
${template.template_name || 'Proposal'}

Overview:
${sections.overview || '[Project Overview]'}

Scope of Work:
${sections.scope || '[Detailed scope description]'}

Timeline:
${sections.timeline || '[Project timeline and milestones]'}

Pricing:
${sections.pricing || '[Pricing breakdown]'}

Terms:
${sections.terms || '[Terms and conditions]'}
    `.trim();
    
    navigator.clipboard.writeText(text);
    alert('Template copied to clipboard!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Proposal Templates</h2>
          <p className="text-xs text-slate-500 mt-1">Create reusable proposal templates for common project types</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ backgroundColor: '#1E5A96' }}>
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Proposal Template</DialogTitle>
              <DialogDescription>Build a reusable template for your proposals.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Home Renovation, Kitchen Remodeling"
                />
              </div>

              {PROPOSAL_SECTIONS.map(section => (
                <div key={section.id}>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{section.label}</label>
                  <Textarea
                    value={formData[section.id]}
                    onChange={(e) => setFormData({ ...formData, [section.id]: e.target.value })}
                    placeholder={`Enter ${section.label.toLowerCase()} content...`}
                    rows={3}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="flex-1 text-white"
                  style={{ backgroundColor: '#1E5A96' }}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-3">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">{template.template_name || 'Untitled Template'}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Created {new Date(template.created_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setViewingId(viewingId === template.id ? null : template.id)}
                    className="p-2 hover:bg-slate-100 rounded text-slate-600"
                    title="View template"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyTemplate(template)}
                    className="p-2 hover:bg-slate-100 rounded text-slate-600"
                    title="Copy template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(template.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {viewingId === template.id && (
                <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-sm text-slate-700 space-y-3 max-h-48 overflow-y-auto">
                  {PROPOSAL_SECTIONS.map(section => {
                    const sections = parseContent(template);
                    return (
                      <div key={section.id}>
                        <h4 className="font-semibold text-slate-900 mb-1">{section.label}</h4>
                        <p className="text-xs whitespace-pre-wrap">{sections[section.id] || '—'}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No proposal templates yet</p>
            <p className="text-slate-400 text-xs mt-1">Create your first template to speed up your proposal writing</p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-xs font-semibold text-blue-900">💡 Pro Tips for Proposal Templates:</p>
        <ul className="text-xs text-blue-800 space-y-1 ml-3 list-disc">
          <li>Create separate templates for different project types</li>
          <li>Include specific timelines and payment schedules</li>
          <li>Add warranty and guarantee information to build trust</li>
          <li>Use clear, professional language throughout</li>
        </ul>
      </div>
    </Card>
  );
}