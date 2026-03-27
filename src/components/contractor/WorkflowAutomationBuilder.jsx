import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function WorkflowAutomationBuilder({ contractorEmail, tierLevel }) {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ automation_name: '', trigger_type: 'scope_created', action_type: 'send_email' });

  useEffect(() => {
    fetchAutomations();
  }, [contractorEmail]);

  const fetchAutomations = async () => {
    try {
      const data = await base44.entities.WorkflowAutomation.filter({ contractor_email: contractorEmail });
      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.automation_name) return;
    try {
      await base44.entities.WorkflowAutomation.create({
        contractor_email: contractorEmail,
        contractor_id: '',
        ...form
      });
      fetchAutomations();
      setForm({ automation_name: '', trigger_type: 'scope_created', action_type: 'send_email' });
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving automation:', error);
    }
  };

  const handleToggle = async (automation) => {
    try {
      await base44.entities.WorkflowAutomation.update(automation.id, { is_active: !automation.is_active });
      fetchAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.WorkflowAutomation.delete(id);
      fetchAutomations();
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  if (tierLevel === 'starter' || tierLevel === 'pro') {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Workflow Automations <Lock className="w-4 h-4 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Upgrade to Wave Max to automate repetitive tasks and workflows.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Workflow Automations</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(!formOpen)}>
            <Plus className="w-4 h-4 mr-2" /> New Automation
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <Input
              placeholder="Automation name"
              value={form.automation_name}
              onChange={(e) => setForm({ ...form, automation_name: e.target.value })}
            />
            <Select value={form.trigger_type} onValueChange={(value) => setForm({ ...form, trigger_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="When..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scope_created">Scope Created</SelectItem>
                <SelectItem value="scope_approved">Scope Approved</SelectItem>
                <SelectItem value="scope_closed">Scope Closed</SelectItem>
                <SelectItem value="payment_received">Payment Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.action_type} onValueChange={(value) => setForm({ ...form, action_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Then..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="create_task">Create Task</SelectItem>
                <SelectItem value="send_notification">Send Notification</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {automations.map((automation) => (
          <div key={automation.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{automation.automation_name}</h4>
                <p className="text-xs text-slate-500">When {automation.trigger_type} → {automation.action_type}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(automation)}>
                  {automation.is_active ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(automation.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {automations.length === 0 && !formOpen && (
          <p className="text-sm text-slate-500 text-center py-4">No automations yet. Create one to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}