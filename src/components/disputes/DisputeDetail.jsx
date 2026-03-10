import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Send, Lock } from 'lucide-react';
import { format } from 'date-fns';

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  open: 'bg-slate-100 text-slate-800',
  in_review: 'bg-blue-100 text-blue-800',
  under_mediation: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-200 text-slate-800',
  escalated: 'bg-red-100 text-red-800'
};

export default function DisputeDetail({ dispute, isAdmin = false }) {
  const [message, setMessage] = useState('');
  const [isAdminNote, setIsAdminNote] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['disputeMessages', dispute.id],
    queryFn: () => base44.entities.DisputeMessage.filter({ dispute_id: dispute.id })
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.asServiceRole.entities.DisputeMessage.create({
        dispute_id: dispute.id,
        sender_email: user.email,
        sender_name: user.full_name || 'User',
        sender_type: isAdmin ? 'admin' : (dispute.initiator_email === user.email ? 'initiator' : 'respondent'),
        message,
        is_admin_note: isAdmin && isAdminNote,
        sent_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['disputeMessages', dispute.id] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{dispute.dispute_number}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{dispute.title}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={severityColors[dispute.severity]}>
                {dispute.severity.toUpperCase()}
              </Badge>
              <Badge className={statusColors[dispute.status]}>
                {dispute.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Filed By</p>
              <p className="font-medium">{dispute.initiator_name}</p>
              <p className="text-sm text-slate-600">{dispute.initiator_email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Against</p>
              <p className="font-medium">{dispute.respondent_name}</p>
              <p className="text-sm text-slate-600">{dispute.respondent_email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Category</p>
              <p className="font-medium">{dispute.category.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Submitted</p>
              <p className="font-medium">{format(new Date(dispute.submitted_at), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-2">Description</p>
            <p className="text-slate-700 whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Evidence ({dispute.evidence_urls.length})</p>
              <div className="flex flex-wrap gap-2">
                {dispute.evidence_urls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    Document {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {isAdmin && dispute.admin_notes && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-slate-500">Admin Notes</p>
              <p className="text-slate-700 mt-1">{dispute.admin_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No messages yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg ${msg.is_admin_note ? 'bg-slate-100 border-l-4 border-slate-400' : 'bg-slate-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{msg.sender_name}</p>
                      <p className="text-xs text-slate-500">{msg.sender_type.toUpperCase()}</p>
                    </div>
                    {msg.is_admin_note && <Lock className="w-3 h-3 text-slate-400" />}
                    <p className="text-xs text-slate-500">{format(new Date(msg.sent_at), 'MMM d, h:mm a')}</p>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">{msg.message}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="admin-note"
                  checked={isAdminNote}
                  onChange={(e) => setIsAdminNote(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="admin-note" className="text-sm text-slate-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private admin note
                </label>
              </div>
            )}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="h-20"
            />
            <Button
              onClick={() => sendMessageMutation.mutate()}
              disabled={sendMessageMutation.isPending || !message.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}