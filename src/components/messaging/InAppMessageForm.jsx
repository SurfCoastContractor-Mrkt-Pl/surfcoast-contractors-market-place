import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Loader2, CheckCircle, Lock } from 'lucide-react';

export default function InAppMessageForm({ open, onClose, paymentRecord, senderType, recipientId, recipientName, recipientEmail }) {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', body: '' });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const msg = await base44.entities.Message.create({
        sender_name: data.name,
        sender_email: data.email,
        sender_type: senderType,
        recipient_id: recipientId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        subject: data.subject,
        body: data.body,
        payment_id: paymentRecord?.id || '',
        read: false,
      });

      // Notify recipient by email (no contact info of sender is exposed)
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `New message on ContractorHub: ${data.subject || '(no subject)'}`,
        body: `Hello ${recipientName},\n\nYou have a new message from a ${senderType === 'contractor' ? 'customer' : 'contractor'} on ContractorHub.\n\n---\n${data.body}\n---\n\nLog in to ContractorHub to view and reply to this message. Contact details are only exchanged after both parties confirm.\n\nContractorHub`,
      });

      return msg;
    },
    onSuccess: () => setSent(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleClose = () => {
    setSent(false);
    setFormData({ name: '', email: '', subject: '', body: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Send Message to {recipientName}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-600 text-sm mb-6">
              Your message has been delivered to <strong>{recipientName}</strong> through ContractorHub. 
              They will be notified by email and can reply within the platform.
            </p>
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
              <Lock className="w-4 h-4 shrink-0" />
              Fee verified — you can now message {recipientName} securely within ContractorHub.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="msg_name">Your Name *</Label>
                <Input
                  id="msg_name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="msg_email">Your Email *</Label>
                <Input
                  id="msg_email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="msg_subject">Subject</Label>
              <Input
                id="msg_subject"
                value={formData.subject}
                onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g., Kitchen renovation inquiry"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="msg_body">Message *</Label>
              <Textarea
                id="msg_body"
                value={formData.body}
                onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
                placeholder="Describe your project, ask questions, or introduce yourself..."
                rows={5}
                required
                className="mt-1.5"
              />
            </div>

            <p className="text-xs text-slate-400">
              Do not share personal phone numbers or emails in your message — all communication stays within ContractorHub until both parties agree to exchange contact details.
            </p>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}