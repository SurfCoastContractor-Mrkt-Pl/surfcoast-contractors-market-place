import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Copy, Trash2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const RESIDENTIAL_TEMPLATES = [
  {
    type: 'contract',
    name: 'Residential Service Contract',
    description: 'Complete service agreement with terms, scope, and payment terms'
  },
  {
    type: 'estimate',
    name: 'Residential Estimate/Quote',
    description: 'Itemized estimate with phases and pricing'
  },
  {
    type: 'scope_of_work',
    name: 'Scope of Work (Residential)',
    description: 'Detailed scope with photo-based definition'
  },
  {
    type: 'lien_waiver',
    name: 'Lien Waiver (Conditional)',
    description: 'Conditional lien waiver for progress payments'
  },
  {
    type: 'permit_request',
    name: 'Permit Request Support',
    description: 'Documentation to support permit applications'
  },
  {
    type: 'inspection_checklist',
    name: 'Inspection Checklist',
    description: 'Pre-/post-work inspection form'
  }
];

export default function DocumentTemplateManager({ contractorId, contractorEmail, subscriptionTier }) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);
  const [customContent, setCustomContent] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['documentTemplates', contractorEmail],
    queryFn: () =>
      base44.entities.DocumentTemplate.filter({
        contractor_email: contractorEmail
      })
  });

  const createMutation = useMutation({
    mutationFn: (templateData) =>
      base44.entities.DocumentTemplate.create(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates', contractorEmail] });
      setSelectedType(null);
      setCustomContent('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId) =>
      base44.entities.DocumentTemplate.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates', contractorEmail] });
    }
  });

  const handleCreateTemplate = (baseTemplate) => {
    createMutation.mutate({
      contractor_id: contractorId,
      contractor_email: contractorEmail,
      template_type: baseTemplate.type,
      template_name: baseTemplate.name,
      category: 'residential',
      tier_exclusive: 'residential_bundle',
      is_default: false,
      description: baseTemplate.description,
      content: customContent || `<!-- ${baseTemplate.name} -->\nCustomize this template with your business details.`,
      placeholders: [
        { key: '{{client_name}}', label: 'Client Name', required: true },
        { key: '{{project_address}}', label: 'Project Address', required: true },
        { key: '{{start_date}}', label: 'Start Date', required: true },
        { key: '{{completion_date}}', label: 'Expected Completion', required: false }
      ]
    });
  };

  const isResidentialBundle = subscriptionTier === 'premium_residential';

  if (!isResidentialBundle) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-900">
            Document Templates are exclusive to the <strong>WAVE OS Residential Bundle</strong>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Residential Document Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-6">
            Pre-built templates for residential projects including contracts, estimates, lien waivers, and compliance docs.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {RESIDENTIAL_TEMPLATES.map((template) => (
              <Card key={template.type} className="p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-slate-900 mb-1">{template.name}</h4>
                <p className="text-xs text-slate-600 mb-4">{template.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedType(template.type);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Your Custom Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-slate-500">No custom templates yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{template.template_name}</p>
                    <p className="text-xs text-slate-500">
                      Used {template.usage_count || 0} times
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}