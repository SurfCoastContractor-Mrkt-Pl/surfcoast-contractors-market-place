import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Check } from 'lucide-react';

export default function ProposalClientView({ proposalId }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // Fetch proposal details
  const { data: proposal, isLoading: proposalLoading } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      const result = await base44.entities.Proposal.filter({ id: proposalId });
      return result[0];
    }
  });

  // Fetch proposal options
  const { data: options = [] } = useQuery({
    queryKey: ['proposalOptions', proposalId],
    queryFn: async () => {
      const result = await base44.entities.ProposalOption.filter({
        proposal_id: proposalId
      });
      return result.sort((a, b) => a.data.option_number - b.data.option_number);
    }
  });

  const selectOptionMutation = useMutation({
    mutationFn: async (optionId) => {
      const response = await base44.functions.invoke('selectProposalOption', {
        proposal_id: proposalId,
        option_id: optionId
      });
      return response.data;
    },
    onSuccess: () => {
      // Redirect or show success message
      window.location.href = '/ProjectManagement';
    }
  });

  if (proposalLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!proposal) {
    return <div className="text-center p-8">Proposal not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold">{proposal.data.job_title}</h1>
        <p className="text-muted-foreground mt-2">From {proposal.data.contractor_name}</p>
        {proposal.data.notes && (
          <p className="text-sm mt-4 text-foreground">{proposal.data.notes}</p>
        )}
      </div>

      {/* Status message */}
      {proposal.data.status === 'option_selected' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900">
          ✓ You've selected Option: {options.find(o => o.id === proposal.data.selected_option_id)?.data.title}
        </div>
      )}

      {/* Options grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose an Option</h2>
        <div className="grid gap-6">
          {options.map((option) => (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all ${
                selectedOptionId === option.id ? 'ring-2 ring-blue-500' : ''
              } ${
                proposal.data.selected_option_id === option.id ? 'bg-green-50' : ''
              }`}
              onClick={() => setSelectedOptionId(option.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{option.data.title}</CardTitle>
                    <CardDescription>Option {option.data.option_number}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${option.data.cost_amount}</div>
                    <Badge variant="outline">{option.data.cost_type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{option.data.description}</p>

                {option.data.estimated_duration && (
                  <div className="text-sm">
                    <span className="font-semibold">Estimated Duration:</span> {option.data.estimated_duration}
                  </div>
                )}

                {option.data.includes && option.data.includes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                    <ul className="space-y-1 text-sm">
                      {option.data.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {option.data.excludes && option.data.excludes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Not Included:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {option.data.excludes.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {option.data.notes && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <span className="font-semibold">Note:</span> {option.data.notes}
                  </div>
                )}

                {proposal.data.status !== 'option_selected' && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => selectOptionMutation.mutate(option.id)}
                    disabled={selectOptionMutation.isPending}
                  >
                    {selectOptionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Selecting...
                      </>
                    ) : (
                      'Select This Option'
                    )}
                  </Button>
                )}

                {proposal.data.selected_option_id === option.id && (
                  <div className="bg-green-100 p-3 rounded text-center text-sm font-semibold text-green-900">
                    ✓ Selected
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}