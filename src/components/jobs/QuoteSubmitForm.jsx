import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, DollarSign, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuoteSubmitForm({ job, contractor }) {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    price: '',
    price_type: 'fixed',
    message: '',
    availability_date: '',
  });

  const queryClient = useQueryClient();

  // Check if contractor already submitted a quote for this job
  const { data: existingQuote } = useQuery({
    queryKey: ['my-quote', job.id, contractor.email],
    queryFn: () => base44.entities.Quote.filter({ job_id: job.id, contractor_email: contractor.email }),
    select: (data) => data?.[0],
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Quote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quote', job.id, contractor.email] });
      queryClient.invalidateQueries({ queryKey: ['job-quotes', job.id] });
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.price || !form.message.trim()) return;

    submitMutation.mutate({
      job_id: job.id,
      job_title: job.title,
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      contractor_email: contractor.email,
      customer_email: job.poster_email,
      price: parseFloat(form.price),
      price_type: form.price_type,
      message: form.message.trim(),
      availability_date: form.availability_date || undefined,
      status: 'pending',
    });
  };

  // Already submitted (from DB or current session)
  if (existingQuote || submitted) {
    return (
      <Card className="p-6 border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-green-800">Quote Submitted</h3>
            <p className="text-sm text-green-700">
              You quoted <strong>${existingQuote?.price ?? parseFloat(form.price)}</strong> ({existingQuote?.price_type ?? form.price_type}).
              The customer will be notified.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <button
        type="button"
        className="w-full flex items-center justify-between p-6 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Submit a Price Quote</h3>
            <p className="text-sm text-slate-500">Send your price and message directly to the customer</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Your Price ($) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 850"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Price Type</Label>
              <Select value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="estimated">Estimated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Availability Date</Label>
            <Input
              type="date"
              value={form.availability_date}
              onChange={(e) => setForm({ ...form, availability_date: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Message to Customer <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Describe your experience, approach, and why you're the right fit for this job..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="mt-1 resize-none"
              required
            />
            <p className="text-xs text-slate-400 mt-1">{form.message.length} / 1000 characters</p>
          </div>

          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: '#1E5A96' }}
            disabled={submitMutation.isPending || !form.price || !form.message.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit Quote'}
          </Button>
        </form>
      )}
    </Card>
  );
}