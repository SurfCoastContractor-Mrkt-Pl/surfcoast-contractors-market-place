import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MessageSquare, Calendar, Phone, Mail, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const INTERACTION_TYPES = [
  { id: 'call', label: 'Phone Call', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'message', label: 'Message', icon: MessageSquare },
  { id: 'meeting', label: 'Meeting', icon: Calendar },
];

export default function ClientRelationshipManager({ contractorId, contractorEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    interactionType: 'call',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: interactions } = useQuery({
    queryKey: ['client-interactions', contractorId],
    queryFn: () => base44.entities.Message.filter({ sender_email: contractorEmail }),
    enabled: !!contractorId && !!contractorEmail,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Message.create({
        sender_name: 'CRM Note',
        sender_email: contractorEmail,
        sender_type: 'contractor',
        recipient_id: contractorId,
        recipient_name: data.clientName,
        recipient_email: data.clientEmail,
        subject: `Interaction: ${data.interactionType}`,
        body: data.notes,
        payment_id: 'crm',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-interactions', contractorId] });
      resetForm();
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Message.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-interactions', contractorId] });
    },
  });

  const handleSubmit = () => {
    if (formData.clientName && formData.interactionType && formData.notes) {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      interactionType: 'call',
      notes: '',
    });
  };

  const getInteractionIcon = (type) => {
    const interaction = INTERACTION_TYPES.find(i => i.id === type);
    return interaction ? <interaction.icon className="w-4 h-4" /> : null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Client Relationship Manager</h2>
          <p className="text-xs text-slate-500 mt-1">Track interactions and manage client relationships</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ backgroundColor: '#1E5A96' }}>
              <Plus className="w-4 h-4" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Client Interaction</DialogTitle>
              <DialogDescription>Record a call, email, message, or meeting with a client.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Client Name</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Interaction Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {INTERACTION_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, interactionType: type.id })}
                      className={`p-2 rounded-lg border transition-all ${
                        formData.interactionType === type.id
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                      title={type.label}
                    >
                      <type.icon className="w-5 h-5 mx-auto text-slate-600" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What did you discuss? Any action items? Next steps?"
                  rows={4}
                />
              </div>

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
                  {createMutation.isPending ? 'Logging...' : 'Log Interaction'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Interactions Timeline */}
      <div className="space-y-3">
        {interactions && interactions.length > 0 ? (
          interactions.map((interaction) => {
            const interactionType = INTERACTION_TYPES.find(t => interaction.subject?.includes(t.label));
            return (
              <div key={interaction.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="mt-1">
                  {interactionType ? <interactionType.icon className="w-5 h-5 text-slate-600" /> : <MessageSquare className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-slate-900">{interaction.recipient_name}</h4>
                      <div className="flex gap-2 mt-1">
                        {interaction.recipient_email && (
                          <a href={`mailto:${interaction.recipient_email}`} className="text-xs text-blue-600 hover:underline">
                            {interaction.recipient_email}
                          </a>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(interaction.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(interaction.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{interaction.body}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No client interactions logged yet</p>
            <p className="text-slate-400 text-xs mt-1">Start tracking your client conversations and follow-ups</p>
          </div>
        )}
      </div>

      {/* Tip Box */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800">
          <strong>Tip:</strong> Regularly log client interactions to maintain strong relationships and track communication history for future reference.
        </p>
      </div>
    </Card>
  );
}