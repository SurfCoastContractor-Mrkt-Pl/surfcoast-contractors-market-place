import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MessageSquare, Calendar, Phone, Mail, Trash2, Users, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

const INTERACTION_TYPES = [
  { id: 'call', label: 'Phone Call', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'message', label: 'Message', icon: MessageSquare },
  { id: 'meeting', label: 'Meeting', icon: Calendar },
];

export default function ClientRelationshipManager({ contractorId, contractorEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    interactionType: 'call', notes: '',
  });

  const queryClient = useQueryClient();

  // Pull real past clients from completed scopes
  const { data: pastScopes = [] } = useQuery({
    queryKey: ['past-scopes-crm', contractorEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({
      contractor_email: contractorEmail,
      status: 'closed'
    }),
    enabled: !!contractorEmail,
  });

  // Build unique client list from scopes
  const clients = useMemo(() => {
    const map = {};
    pastScopes.forEach(scope => {
      const key = scope.client_email;
      if (!map[key]) {
        map[key] = {
          name: scope.client_name,
          email: scope.client_email,
          jobCount: 0,
          lastJob: scope.job_title,
          lastDate: scope.closed_date || scope.updated_date,
          totalValue: 0,
        };
      }
      map[key].jobCount++;
      map[key].totalValue += (scope.contractor_payout_amount || scope.cost_amount || 0);
      if (new Date(scope.closed_date) > new Date(map[key].lastDate)) {
        map[key].lastDate = scope.closed_date;
        map[key].lastJob = scope.job_title;
      }
    });
    return Object.values(map).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
  }, [pastScopes]);

  // CRM notes (stored as messages with payment_id='crm')
  const { data: interactions = [] } = useQuery({
    queryKey: ['client-interactions', contractorEmail, selectedClient?.email],
    queryFn: () => base44.entities.Message.filter({
      sender_email: contractorEmail,
      recipient_email: selectedClient?.email
    }),
    enabled: !!contractorEmail && !!selectedClient?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create({
      sender_name: 'CRM Note',
      sender_email: contractorEmail,
      sender_type: 'contractor',
      recipient_id: contractorId,
      recipient_name: data.clientName,
      recipient_email: data.clientEmail,
      subject: `[CRM] ${INTERACTION_TYPES.find(t => t.id === data.interactionType)?.label || data.interactionType}`,
      body: data.notes,
      payment_id: 'crm',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-interactions'] });
      setFormData({ clientName: '', clientEmail: '', clientPhone: '', interactionType: 'call', notes: '' });
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-interactions'] }),
  });

  const openLogFor = (client) => {
    setSelectedClient(client);
    setFormData(f => ({ ...f, clientName: client.name, clientEmail: client.email }));
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Client Relationship Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">Past clients from completed jobs · Track interactions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Client Interaction</DialogTitle>
              <DialogDescription>Record a call, email, message, or meeting.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Client Name</label>
                  <Input value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} placeholder="John Smith" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Client Email</label>
                  <Input type="email" value={formData.clientEmail} onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Interaction Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {INTERACTION_TYPES.map(type => (
                    <button key={type.id} onClick={() => setFormData({ ...formData, interactionType: type.id })}
                      className={`p-2 rounded-lg border transition-all ${formData.interactionType === type.id ? 'bg-blue-100 border-blue-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                      title={type.label}>
                      <type.icon className="w-5 h-5 mx-auto text-slate-600" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What did you discuss? Any action items? Next steps?" rows={4} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Cancel</Button>
                <Button onClick={() => formData.clientName && formData.notes && createMutation.mutate(formData)}
                  disabled={createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? 'Logging...' : 'Log Interaction'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No past clients yet</p>
          <p className="text-slate-400 text-xs mt-1">Complete jobs to see your client history here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map(client => {
            const clientInteractions = interactions.filter(i => i.recipient_email === client.email);
            const isSelected = selectedClient?.email === client.email;
            return (
              <Card key={client.email} className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedClient(isSelected ? null : client)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {client.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{client.name}</p>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs text-slate-500">{client.jobCount} job{client.jobCount !== 1 ? 's' : ''}</p>
                      <p className="text-xs font-medium text-green-700">${(client.totalValue).toFixed(0)} earned</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openLogFor(client); }} className="text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Log
                    </Button>
                  </div>
                </div>

                {/* Expanded: interactions timeline */}
                {isSelected && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Last job: <span className="text-slate-800">{client.lastJob}</span>
                      {client.lastDate && <span className="text-slate-400 ml-1">({format(new Date(client.lastDate), 'MMM d, yyyy')})</span>}
                    </p>
                    {interactions.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No logged interactions yet. Click "Log" to add one.</p>
                    ) : (
                      <div className="space-y-2">
                        {interactions.map(note => (
                          <div key={note.id} className="flex items-start gap-2 text-xs">
                            <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-slate-500">{format(new Date(note.created_date), 'MMM d')} · </span>
                              <span className="text-slate-700">{note.body}</span>
                            </div>
                            <button onClick={() => deleteMutation.mutate(note.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}