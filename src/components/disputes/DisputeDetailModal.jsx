import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Upload, Send, Clock, CheckCircle2, MessageCircle, FileText, Loader2 } from 'lucide-react';

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  under_mediation: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800',
  escalated: 'bg-red-100 text-red-800'
};

export default function DisputeDetailModal({ dispute, open, onClose, currentUser, onDisputeUpdated }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const isInitiator = dispute.initiator_email === currentUser?.email;
  const isRespondent = dispute.respondent_email === currentUser?.email;

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open, dispute.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const disputeMessages = await base44.entities.DisputeMessage.filter({
        dispute_id: dispute.id
      });
      setMessages(disputeMessages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadEvidence = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (let file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(response.file_url);
      }

      // Create a message with evidence
      await base44.entities.DisputeMessage.create({
        dispute_id: dispute.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_type: isInitiator ? 'initiator' : isRespondent ? 'respondent' : 'admin',
        message: `Uploaded ${uploadedUrls.length} evidence file(s)`,
        attachment_urls: uploadedUrls,
        sent_at: new Date().toISOString()
      });

      await fetchMessages();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await base44.entities.DisputeMessage.create({
        dispute_id: dispute.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_type: isInitiator ? 'initiator' : isRespondent ? 'respondent' : 'admin',
        message: newMessage,
        sent_at: new Date().toISOString()
      });

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{dispute.title}</span>
            <Badge className={statusColors[dispute.status]}>
              {dispute.status.replace(/_/g, ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Filed on {new Date(dispute.submitted_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dispute Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Description</p>
                <p className="text-slate-900">{dispute.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Category</p>
                  <p className="text-slate-900">{dispute.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Severity</p>
                  <p className="text-slate-900 capitalize">{dispute.severity}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">You are</p>
                  <p className="text-slate-900 capitalize">{isInitiator ? 'Initiator' : 'Respondent'}</p>
                </div>
                {dispute.job_title && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Related Job</p>
                    <p className="text-slate-900">{dispute.job_title}</p>
                  </div>
                )}
              </div>
              {dispute.admin_notes && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes</p>
                  <p className="text-sm text-blue-800">{dispute.admin_notes}</p>
                </div>
              )}
              {dispute.resolution_details && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-1">Resolution</p>
                  <p className="text-sm text-green-800">{dispute.resolution_details}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Evidence & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Initial Evidence</p>
                  <div className="space-y-2">
                    {dispute.evidence_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 text-sm text-blue-600 truncate"
                      >
                        Evidence File {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-600 mb-3">Add More Evidence</p>
                <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Click to upload evidence</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleUploadEvidence}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Communication Thread
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No messages yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender_email === currentUser.email
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm text-slate-900">{msg.sender_name}</p>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{msg.message}</p>
                      {msg.attachment_urls && msg.attachment_urls.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachment_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-blue-600 hover:underline"
                            >
                              📎 Attachment {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message Input */}
              {['open', 'in_review', 'under_mediation'].includes(dispute.status) && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <Textarea
                    placeholder="Add a message to the dispute..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="w-full"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}