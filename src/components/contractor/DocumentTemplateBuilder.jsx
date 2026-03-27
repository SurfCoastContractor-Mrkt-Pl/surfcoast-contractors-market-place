import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Plus, Trash2 } from 'lucide-react';

export default function DocumentTemplateBuilder({ contractorEmail, tierLevel }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ template_type: 'proposal', template_name: '', content: '' });

  useEffect(() => {
    fetchTemplates();
  }, [contractorEmail]);

  const fetchTemplates = async () => {
    try {
      const data = await base44.entities.DocumentTemplate.filter({ contractor_email: contractorEmail });
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.template_name || !form.content) return;
    try {
      await base44.entities.DocumentTemplate.create({
        contractor_email: contractorEmail,
        contractor_id: '', // Will be populated by backend
        ...form
      });
      fetchTemplates();
      setForm({ template_type: 'proposal', template_name: '', content: '' });
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.DocumentTemplate.delete(id);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (tierLevel === 'starter') {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Document Templates <Lock className="w-4 h-4 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Upgrade to Wave Pro to create custom document templates for proposals, contracts, and more.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Document Templates</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(!formOpen)}>
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <Input
              placeholder="Template name"
              value={form.template_name}
              onChange={(e) => setForm({ ...form, template_name: e.target.value })}
            />
            <Select value={form.template_type} onValueChange={(value) => setForm({ ...form, template_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="scope_of_work">Scope of Work</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Template content (use {{customer_name}}, {{job_title}}, {{cost_amount}}, etc.)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {templates.map((template) => (
          <div key={template.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{template.template_name}</h4>
                <p className="text-xs text-slate-500">{template.template_type}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(template.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {templates.length === 0 && !formOpen && (
          <p className="text-sm text-slate-500 text-center py-4">No templates yet. Create one to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}