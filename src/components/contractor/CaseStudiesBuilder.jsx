import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CaseStudiesBuilder({ contractorId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    challenge: '',
    solution: '',
    results: '',
    industry: 'general',
  });

  const queryClient = useQueryClient();

  const { data: caseStudies } = useQuery({
    queryKey: ['contractor-case-studies', contractorId],
    queryFn: () => base44.entities.PortfolioProject.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.PortfolioProject.create({
        contractor_id: contractorId,
        project_title: data.title,
        description: `**Challenge:** ${data.challenge}\n\n**Solution:** ${data.solution}\n\n**Results:** ${data.results}`,
        trade_category: data.industry,
        completion_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-case-studies', contractorId] });
      resetForm();
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.PortfolioProject.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-case-studies', contractorId] });
    },
  });

  const handleSubmit = () => {
    if (formData.title && formData.challenge && formData.solution && formData.results) {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', challenge: '', solution: '', results: '', industry: 'general' });
    setEditingId(null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Case Studies & Projects</h2>
          <p className="text-xs text-slate-500 mt-1">Showcase your best work and highlight real-world results</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ backgroundColor: '#1E5A96' }}>
              <Plus className="w-4 h-4" />
              New Case Study
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Case Study</DialogTitle>
              <DialogDescription>Showcase a completed project with challenge, solution, and results.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Project Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Kitchen Renovation"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Challenge / Problem</label>
                <Textarea
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                  placeholder="Describe the initial problem or challenge the customer faced..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Solution / Approach</label>
                <Textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Explain how you solved the problem and what you implemented..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Results / Outcomes</label>
                <Textarea
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  placeholder="Describe the measurable results and customer satisfaction..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Industry / Trade</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="general">General</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumbing</option>
                  <option value="carpenter">Carpentry</option>
                  <option value="hvac">HVAC</option>
                  <option value="painter">Painting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="flex-1 text-white"
                  style={{ backgroundColor: '#1E5A96' }}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Case Study'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Case Studies List */}
      <div className="space-y-3">
        {caseStudies && caseStudies.length > 0 ? (
          caseStudies.map((study) => (
            <div key={study.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === study.id ? null : study.id)}
                className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-2xl">📊</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{study.project_title}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {study.trade_category}
                    </Badge>
                  </div>
                </div>
                {expandedId === study.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </button>

              {expandedId === study.id && (
                <div className="p-4 bg-white border-t border-slate-200 space-y-4">
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                    {study.description}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => setEditingId(study.id)}
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 text-red-600 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(study.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-3">No case studies yet</p>
            <p className="text-slate-400 text-xs">
              Create your first case study to showcase your best work and attract more customers.
            </p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Pro Tip:</strong> Include specific metrics, timelines, and customer testimonials in your case studies to build trust and credibility with potential clients.
        </p>
      </div>
    </Card>
  );
}