import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function ContractorProposalForm({ scopeRequest, contractorId, contractorName, contractorEmail, onSuccess }) {
  const [proposal, setProposal] = useState('');
  const [costType, setCostType] = useState('fixed');
  const [costAmount, setCostAmount] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Verify authenticated contractor
      try {
        const user = await base44.auth.me();
        if (!user?.email) {
          throw new Error('You must be logged in to submit a proposal');
        }
      } catch (err) {
        throw err;
      }
      return base44.entities.ContractorScopeProposal.create(data);
    },
    onSuccess: (result) => {
      setSuccess(true);
      setProposal('');
      setCostAmount('');
      setEstimatedHours('');
      setWorkDate('');
      setCostType('fixed');
      queryClient.invalidateQueries({ queryKey: ['contractor-proposals', scopeRequest.id] });
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess(result);
      }, 2000);
    },
    onError: (err) => {
      setError(`Error creating proposal: ${err.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!proposal.trim()) {
      setError('Please describe your proposal');
      return;
    }

    if (!costAmount || Number(costAmount) <= 0) {
      setError('Please enter a valid cost amount');
      return;
    }

    if (costType === 'hourly' && !estimatedHours) {
      setError('Please estimate hours for hourly work');
      return;
    }

    if (!workDate) {
      setError('Please provide an agreed work date');
      return;
    }

    mutation.mutate({
      scope_request_id: scopeRequest.id,
      job_id: scopeRequest.job_id,
      contractor_id: contractorId,
      contractor_name: contractorName,
      contractor_email: contractorEmail,
      customer_name: scopeRequest.customer_name,
      customer_email: scopeRequest.customer_email,
      job_title: scopeRequest.job_title,
      proposal_summary: proposal,
      cost_type: costType,
      cost_amount: Number(costAmount),
      estimated_hours: costType === 'hourly' ? Number(estimatedHours) : null,
      agreed_work_date: workDate,
      status: 'pending_customer_review',
    });
  };

  if (success) {
    return (
      <Card className="p-6 text-center bg-green-50 border-green-200">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Proposal Sent!</h3>
        <p className="text-sm text-slate-600">The customer will review your proposal and respond with approval or feedback.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-50 border-amber-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Submit Your Proposal</h3>
        <p className="text-sm text-slate-500 mt-1">Respond to the customer's scope request with your solution and pricing.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="proposal">Your Proposal *</Label>
          <Textarea
            id="proposal"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Describe how you'll handle this scope. Include your approach, timeline, materials, and any special considerations..."
            rows={5}
            className="resize-none mt-1.5"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Cost Type *</Label>
            <Select value={costType} onValueChange={setCostType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cost">Cost Amount ($) *</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
              placeholder={costType === 'hourly' ? 'Hourly rate' : 'Total price'}
              className="mt-1.5"
            />
          </div>
        </div>

        {costType === 'hourly' && (
          <div>
            <Label htmlFor="hours">Estimated Hours *</Label>
            <Input
              id="hours"
              type="number"
              min="0.5"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g., 8, 16, 40"
              className="mt-1.5"
            />
          </div>
        )}

        <div>
          <Label htmlFor="work_date">Agreed Work Date *</Label>
          <Input
            id="work_date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
            ) : (
              'Submit Proposal'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}