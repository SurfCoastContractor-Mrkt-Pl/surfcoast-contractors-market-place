import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ProposalBuilder({ proposalId, contractorId }) {
  const queryClient = useQueryClient();
  const [options, setOptions] = useState([]);
  const [expandedForm, setExpandedForm] = useState(null);

  // Fetch existing options
  const { data: fetchedOptions } = useQuery({
    queryKey: ['proposalOptions', proposalId],
    queryFn: async () => {
      const result = await base44.entities.ProposalOption.filter({
        proposal_id: proposalId
      });
      return result;
    }
  });

  React.useEffect(() => {
    if (fetchedOptions) {
      setOptions(fetchedOptions);
    }
  }, [fetchedOptions]);

  const addOptionMutation = useMutation({
    mutationFn: async (optionData) => {
      const response = await base44.functions.invoke('addProposalOption', {
        proposal_id: proposalId,
        ...optionData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposalOptions', proposalId] });
      setExpandedForm(null);
    }
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (optionId) => {
      await base44.entities.ProposalOption.delete(optionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposalOptions', proposalId] });
    }
  });

  const handleAddOption = async (formData) => {
    await addOptionMutation.mutateAsync(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proposal Options</h2>
        <Button onClick={() => setExpandedForm('new')} className="gap-2">
          <Plus className="w-4 h-4" /> Add Option
        </Button>
      </div>

      {/* Display existing options */}
      <div className="space-y-4">
        {options.map((option) => (
          <Card key={option.id}>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg">{option.data.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Option {option.data.option_number}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteOptionMutation.mutate(option.id)}
                disabled={deleteOptionMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">{option.data.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Cost Type:</span> {option.data.cost_type}
                </div>
                <div>
                  <span className="font-semibold">Amount:</span> ${option.data.cost_amount}
                </div>
                {option.data.estimated_duration && (
                  <div>
                    <span className="font-semibold">Duration:</span> {option.data.estimated_duration}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add option form */}
      {expandedForm === 'new' && (
        <OptionForm
          onSubmit={handleAddOption}
          onCancel={() => setExpandedForm(null)}
          isLoading={addOptionMutation.isPending}
        />
      )}
    </div>
  );
}

function OptionForm({ onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost_type: 'fixed',
    cost_amount: 0,
    estimated_hours: 0,
    estimated_duration: '',
    scope_summary: '',
    includes: [],
    excludes: [],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base">New Option</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Option title (e.g., Basic, Premium)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description of this option"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              className="px-3 py-2 border rounded-lg"
              value={formData.cost_type}
              onChange={(e) => setFormData({ ...formData, cost_type: e.target.value })}
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly</option>
            </select>
            <Input
              type="number"
              placeholder="Cost amount"
              value={formData.cost_amount}
              onChange={(e) => setFormData({ ...formData, cost_amount: parseFloat(e.target.value) })}
              required
            />
          </div>
          <Input
            placeholder="Estimated duration (e.g., 2-4 hours)"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Option
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}