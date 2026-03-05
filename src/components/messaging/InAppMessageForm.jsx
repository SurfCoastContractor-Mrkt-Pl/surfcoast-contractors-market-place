import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasActiveSubscription } from '@/components/subscription/subscriptionUtils';

// Simple rate limiting for message spam prevention
const createRateLimiter = (intervalMs) => {
  let lastTime = 0;
  return () => {
    const now = Date.now();
    if (now - lastTime < intervalMs) {
      return false;
    }
    lastTime = now;
    return true;
  };
};

import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Loader2, Lock, Send, CalendarCheck, AlertTriangle, Paperclip, Check, Clock } from 'lucide-react';
import MessageAttachments from './MessageAttachments';
import ReadReceipt from './ReadReceipt';

export default function InAppMessageForm({ open, onClose, paymentRecord, senderType, recipientId, recipientName, recipientEmail }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '' });
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [checkingSubscription, setCheckingSubscription] = useState(true);
    const queryClient = useQueryClient();
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);
    const rateLimiter = useRef(createRateLimiter(1000)).current; // 1 second between messages

  const paymentId = paymentRecord?.id;
  const isWorkScheduled = paymentRecord?.status === 'work_scheduled';

  // 1-hour session expiry logic
  const sessionExpiry = paymentRecord?.session_expires_at ? new Date(paymentRecord.session_expires_at) : null;
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);
  const isSessionExpired = sessionExpiry && now > sessionExpiry && !isWorkScheduled;
  const minutesLeft = sessionExpiry ? Math.max(0, Math.floor((sessionExpiry - now) / 60000)) : null;
  const secondsLeft = sessionExpiry ? Math.max(0, Math.floor((sessionExpiry - now) / 1000) % 60) : null;

  // Check for active subscription when dialog opens
  useEffect(() => {
    const checkSubscription = async () => {
      if (!open || !formData.email) {
        setCheckingSubscription(false);
        return;
      }
      try {
        const has = await hasActiveSubscription(formData.email);
        setHasSubscription(has);
      } finally {
        setCheckingSubscription(false);
      }
    };
    
    checkSubscription();
  }, [open, formData.email]);

  // Load the thread — all messages tied to this payment (with pagination)
   const [pageSize] = useState(50);
   const { data: thread = [] } = useQuery({
     queryKey: ['message-thread', paymentId],
     queryFn: async () => {
       const messages = await base44.entities.Message.filter({ payment_id: paymentId }, '-created_date', pageSize);
       return messages;
     },
     enabled: open && !!paymentId,
     refetchInterval: open ? 8000 : false,
   });

   // Mark unread messages as read when thread is viewed
   const markAsReadMutation = useMutation({
     mutationFn: async (messageId) => {
       await base44.entities.Message.update(messageId, {
         read: true,
         read_at: new Date().toISOString()
       });
     },
   });

   // Auto-mark received messages as read
   useEffect(() => {
     if (!open || senderType === 'contractor') return; // Only customers auto-read
     thread.forEach(msg => {
       if (!msg.read && msg.sender_type !== senderType) {
         markAsReadMutation.mutate(msg.id);
       }
     });
   }, [thread, open, senderType]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newAttachments = [];
      for (const file of files) {
        const url = await base44.integrations.Core.UploadFile({ file });
        newAttachments.push({
          url: url.file_url,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document'
        });
      }
      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMutation = useMutation({
      mutationFn: async () => {
        // Rate limiting check
        if (!rateLimiter()) {
          throw new Error('Please wait before sending another message');
        }

        // Validate email before sending
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          throw new Error('Please provide a valid email address');
        }

        const msg = await base44.entities.Message.create({
          sender_name: formData.name,
          sender_email: formData.email,
          sender_type: senderType,
          recipient_id: recipientId,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          subject: formData.subject,
          body,
          file_urls: attachments,
          payment_id: paymentId,
          read: false,
        });

        // Mark sent message as read
        await base44.entities.Message.update(msg.id, {
          read: true,
          read_at: new Date().toISOString()
        });

        await base44.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: `📬 New Message on ContractorHub${formData.subject ? ': ' + formData.subject : ''}`,
          body: `Hello ${recipientName},\n\nYou have a new message on ContractorHub.\n\nFrom: ${formData.name}\nMessage:\n---\n${body}\n---\n${attachments.length > 0 ? `\nFiles attached: ${attachments.length}\n` : ''}Log in to ContractorHub to reply. Your contact details remain protected within the platform.\n\nContractorHub\n(Do not reply to this automated email)`,
        });

        return msg;
      },
      onSuccess: () => {
        setBody('');
        setAttachments([]);
        queryClient.invalidateQueries({ queryKey: ['message-thread', paymentId] });
      },
    });

  const scheduleMutation = useMutation({
    mutationFn: () => base44.entities.Payment.update(paymentId, { status: 'work_scheduled' }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['message-thread', paymentId] });
      // Notify both parties
      await Promise.all([
        base44.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: '✅ Work Scheduled — ContractorHub',
          body: `Hello ${recipientName},\n\nBoth you and the other party have agreed on the work. This engagement has been marked as "Work Scheduled" on ContractorHub.\n\nNo further in-app messaging is available for this session. If you need to communicate again for a new job, a new $1.50 platform access fee will apply.\n\nThank you for using ContractorHub!`,
        }),
        formData.email ? base44.integrations.Core.SendEmail({
          to: formData.email,
          subject: '✅ Work Scheduled — ContractorHub',
          body: `Hello ${formData.name},\n\nThis engagement with ${recipientName} has been marked as "Work Scheduled". Both parties have agreed and an appointment has been set.\n\nThis session is now closed. A new $1.50 fee applies to open a new communication session.\n\nContractorHub`,
        }) : Promise.resolve(),
      ]);
      setShowScheduleConfirm(false);
    },
  });

  const handleClose = () => {
    setBody('');
    setShowScheduleConfirm(false);
    onClose();
  };

  // Show payment gate only if no subscription and no confirmed payment
  if ((!paymentRecord || paymentRecord.status !== 'confirmed') && !hasSubscription) {
      return (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Message {recipientName}
              </DialogTitle>
              <p className="sr-only">Payment required dialog for messaging</p>
            </DialogHeader>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Access Required</h3>
              <p className="text-slate-600 text-sm mb-6">Pay $1.50 for one session or $20/month for unlimited messaging.</p>
              <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Go Back</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

  // First message setup (no thread yet and no name saved)
  const needsSetup = thread.length === 0 && !formData.name;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Conversation with {recipientName}
            {isWorkScheduled && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal flex items-center gap-1">
                <CalendarCheck className="w-3 h-3" /> Work Scheduled
              </span>
            )}
          </DialogTitle>
          <p className="sr-only">Conversation with {recipientName}</p>
        </DialogHeader>

        {isSessionExpired ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Session Expired</h3>
            <p className="text-slate-600 text-sm mb-4">
              Your 1-hour communication session has ended. Past messages are shown below for your records.
            </p>
            <p className="text-xs text-slate-400 mb-6">To continue communicating, a new $1.50 platform access fee is required.</p>
            {thread.length > 0 && (
              <div className="text-left space-y-3 max-h-64 overflow-y-auto bg-slate-50 rounded-xl p-4 mb-4">
                {thread.map(m => (
                  <div key={m.id} className="border-b border-slate-200 pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-800 text-sm">{m.sender_name}</span>
                      <span className="text-xs text-slate-400">{new Date(m.created_date).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Close</Button>
          </div>
        ) : isWorkScheduled ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Work Scheduled</h3>
            <p className="text-slate-600 text-sm mb-4">
              This session has been closed — both parties agreed and an appointment was set. 
              Past messages are shown below for your records.
            </p>
            <p className="text-xs text-slate-400 mb-6">To open a new communication session, a new $1.50 platform access fee will apply.</p>
            {/* Show past messages read-only */}
            {thread.length > 0 && (
            <div className="text-left space-y-3 max-h-64 overflow-y-auto bg-slate-50 rounded-xl p-4 mb-4">
            {thread.map(m => (
              <div key={m.id} className="border-b border-slate-200 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800 text-sm">{m.sender_name}</span>
                  <span className="text-xs text-slate-400">{new Date(m.created_date).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{m.body}</p>
                {m.file_urls?.length > 0 && (
                  <div className="mt-2">
                    <MessageAttachments files={m.file_urls} isReadOnly={true} />
                  </div>
                )}
              </div>
            ))}
            </div>
            )}
            <Button onClick={handleClose} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Close</Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Session timer banner */}
            {sessionExpiry && !isSessionExpired && minutesLeft < 15 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm ${minutesLeft < 5 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                <Clock className="w-4 h-4 shrink-0" />
                <span>Session expires in <strong>{minutesLeft}m {secondsLeft}s</strong>. Mark as Work Scheduled before it ends to close this session properly.</span>
              </div>
            )}
            {/* Sender setup — only needed once */}
            {needsSetup && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 space-y-3">
                <p className="text-sm font-medium text-slate-700">Enter your details to start messaging:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="msg_name" className="text-xs">Your Name *</Label>
                    <Input id="msg_name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="msg_email" className="text-xs">Your Email *</Label>
                    <Input id="msg_email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="mt-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Thread */}
            {!needsSetup && (
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[120px] max-h-80 pr-1">
                {thread.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">No messages yet. Send the first message below.</div>
                ) : (
                  thread.map(m => (
                    <div key={m.id} className={`p-3 rounded-xl ${m.sender_type === senderType ? 'bg-amber-50 border border-amber-200 ml-8' : 'bg-slate-50 border border-slate-200 mr-8'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 text-sm">{m.sender_name}</span>
                          <span className="text-xs text-slate-400">{new Date(m.created_date).toLocaleString()}</span>
                        </div>
                        {m.sender_type !== senderType && (
                          <div className="flex items-center gap-1 text-xs">
                            {m.read ? (
                              <Check className="w-3 h-3 text-blue-600" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-300" />
                            )}
                          </div>
                        )}
                      </div>
                      {m.subject && <div className="text-xs text-slate-500 mb-1">Subject: {m.subject}</div>}
                      <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{m.body}</p>
                      {m.file_urls?.length > 0 && (
                        <div className="mb-2">
                          <MessageAttachments files={m.file_urls} isReadOnly={true} />
                        </div>
                      )}
                      <ReadReceipt isRead={m.read} readAt={m.read_at} senderType={m.sender_type} currentUserType={senderType} />
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            )}

            {/* Compose */}
            {(!needsSetup || formData.name) && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                {thread.length === 0 && (
                  <div>
                    <Label htmlFor="msg_subject" className="text-xs">Subject</Label>
                    <Input
                      id="msg_subject"
                      value={formData.subject}
                      onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g., Kitchen renovation inquiry"
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                   <Textarea
                     value={body}
                     onChange={e => setBody(e.target.value)}
                     placeholder="Write your message..."
                     rows={3}
                     className="resize-none"
                   />
                 </div>

                 {attachments.length > 0 && (
                   <div>
                     <p className="text-xs font-medium text-slate-600 mb-2">Attachments ({attachments.length})</p>
                     <MessageAttachments
                       files={attachments}
                       onRemove={(idx) => setAttachments(attachments.filter((_, i) => i !== idx))}
                     />
                   </div>
                 )}

                 <div className="flex items-center gap-2">
                   <input
                     ref={fileInputRef}
                     type="file"
                     multiple
                     onChange={handleFileSelect}
                     className="hidden"
                     accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                   />
                   <Button
                     type="button"
                     size="icon"
                     variant="outline"
                     className="shrink-0"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={uploading}
                     title="Attach files (images, PDFs, documents)"
                   >
                     {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                   </Button>

                   <Button
                     onClick={() => sendMutation.mutate()}
                     className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                     disabled={sendMutation.isPending || !body.trim() || !formData.name || !formData.email || uploading || isSessionExpired}
                   >
                     {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                     Send
                   </Button>

                   {thread.length > 0 && !showScheduleConfirm && (
                     <Button
                       variant="outline"
                       className="ml-auto border-green-300 text-green-700 hover:bg-green-50"
                       onClick={() => setShowScheduleConfirm(true)}
                     >
                       <CalendarCheck className="w-4 h-4 mr-1.5" />
                       Mark as Work Scheduled
                     </Button>
                   )}
                 </div>

                {showScheduleConfirm && (
                  <div className="p-4 bg-green-50 border border-green-300 rounded-xl space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">
                        <strong>Confirm Work Scheduled?</strong> This will close this communication session permanently. 
                        Both parties will be notified. A new $1.50 fee is required to reopen messaging with this person.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowScheduleConfirm(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => scheduleMutation.mutate()}
                        disabled={scheduleMutation.isPending}
                      >
                        {scheduleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Yes, Mark as Work Scheduled
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400">
                 {hasSubscription
                   ? '✓ Unlimited messages with your monthly subscription until work is scheduled.'
                   : sessionExpiry
                     ? (minutesLeft > 0 || secondsLeft > 0)
                       ? <span className={`font-medium ${minutesLeft < 5 ? 'text-red-500' : 'text-slate-500'}`}>
                           ⏱ Session expires in {minutesLeft}m {secondsLeft}s — messages included until then or until work is scheduled.
                         </span>
                       : 'Session time has elapsed.'
                     : 'Unlimited messages included with your $1.50 fee until work is scheduled.'
                 }
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}