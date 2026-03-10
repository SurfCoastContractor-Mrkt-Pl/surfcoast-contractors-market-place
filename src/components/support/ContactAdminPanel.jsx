import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ContactAdminPanel({ userEmail, userName }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!category || !subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await base44.functions.invoke('sendAdminContactMessage', {
        userEmail,
        userName,
        category,
        subject,
        message,
      });
      setSending(false);
      setSent(true);
      setSubject('');
      setCategory('');
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setSending(false);
      console.error('Error:', err);
    }
  };

  return (
    <Card className="p-6 border-blue-200 bg-blue-50">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-blue-900">Contact Admin / Support</h2>
      </div>
      <p className="text-sm text-blue-700 mb-5">
        Have a question, suggestion, or inquiry about the platform? Send us a message and we'll get back to you.
      </p>

      {sent ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Message sent successfully!</p>
            <p className="text-xs text-green-600">We'll review your message and respond shortly.</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto text-green-700" onClick={() => setSent(false)}>
            Send Another
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white border-blue-200">
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Question">General Question</SelectItem>
              <SelectItem value="Platform Inquiry">Platform Inquiry</SelectItem>
              <SelectItem value="Suggestion">Suggestion / Feature Request</SelectItem>
              <SelectItem value="Bug Report">Bug Report</SelectItem>
              <SelectItem value="Billing / Payment">Billing / Payment</SelectItem>
              <SelectItem value="Account Issue">Account Issue</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="bg-white border-blue-200"
          />
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="bg-white border-blue-200 min-h-[120px]"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      )}
    </Card>
  );
}