import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrationConnectionManager({ contractorEmail, tierLevel }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ service_name: 'slack', connection_name: '', auth_token: '' });

  useEffect(() => {
    fetchConnections();
  }, [contractorEmail]);

  const fetchConnections = async () => {
    try {
      const data = await base44.entities.IntegrationConnection.filter({ contractor_email: contractorEmail });
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.connection_name || !form.auth_token) return;
    try {
      await base44.entities.IntegrationConnection.create({
        contractor_email: contractorEmail,
        contractor_id: '',
        ...form
      });
      fetchConnections();
      setForm({ service_name: 'slack', connection_name: '', auth_token: '' });
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.IntegrationConnection.delete(id);
      fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  if (tierLevel === 'starter' || tierLevel === 'pro') {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            External Integrations <Lock className="w-4 h-4 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Upgrade to Wave Max to connect external services like Slack, Teams, and Zapier.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>External Integrations</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(!formOpen)}>
            <Plus className="w-4 h-4 mr-2" /> New Connection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <Input
              placeholder="Connection name"
              value={form.connection_name}
              onChange={(e) => setForm({ ...form, connection_name: e.target.value })}
            />
            <Select value={form.service_name} onValueChange={(value) => setForm({ ...form, service_name: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="microsoft_teams">Microsoft Teams</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="custom_webhook">Custom Webhook</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Authentication token or webhook URL"
              value={form.auth_token}
              onChange={(e) => setForm({ ...form, auth_token: e.target.value })}
              type="password"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {connections.map((connection) => (
          <div key={connection.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                {connection.test_status === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {connection.test_status === 'failed' && (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-medium">{connection.connection_name}</h4>
                  <p className="text-xs text-slate-500">{connection.service_name}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(connection.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {connections.length === 0 && !formOpen && (
          <p className="text-sm text-slate-500 text-center py-4">No connections yet.</p>
        )}
      </CardContent>
    </Card>
  );
}