import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import ProposalBuilder from '@/components/proposal/ProposalBuilder';

export default function MultiOptionProposals() {
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Get current user
  React.useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  // Get contractor profile
  React.useEffect(() => {
    if (user?.email) {
      base44.entities.Contractor.filter({ email: user.email }).then(contractors => {
        if (contractors.length) setContractor(contractors[0]);
      });
    }
  }, [user]);

  // Fetch user proposals
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['myProposals', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const result = await base44.entities.Proposal.filter({
        contractor_email: user.email
      });
      return result;
    }
  });

  // Check access
  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Please log in to view proposals</div>;
  }

  if (!contractor) {
    return <div className="p-8 text-center text-muted-foreground">Contractor profile not found</div>;
  }

  const hasAccess = ['tier_2', 'tier_3', 'tier_4', 'tier_5'].includes(contractor.data.profile_tier);

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-5 h-5" />
              Feature Not Available
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-800">
            Multi-option proposals are only available for Wave FO contractors at tier 2 and above.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Multi-Option Proposals</h1>
          <p className="text-muted-foreground mt-1">Create and manage proposal options for your jobs</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Proposal
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <NewProposalForm
          contractorId={contractor.data.id}
          onSuccess={() => {
            setShowForm(false);
            window.location.reload();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Proposals list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No proposals yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProposal(proposal.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{proposal.data.job_title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Client: {proposal.data.customer_name}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium">
                    {proposal.data.status}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Edit proposal */}
      {selectedProposal && (
        <div className="space-y-4 mt-8">
          <Button variant="outline" onClick={() => setSelectedProposal(null)}>
            ← Back to List
          </Button>
          <ProposalBuilder proposalId={selectedProposal} contractorId={contractor.data.id} />
        </div>
      )}
    </div>
  );
}

function NewProposalForm({ contractorId, onSuccess, onCancel }) {
  const [formData, setFormData] = React.useState({
    customer_name: '',
    customer_email: '',
    job_title: '',
    job_id: '',
    notes: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.functions.invoke('createProposal', formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle>Create New Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Customer Name"
            className="w-full px-3 py-2 border rounded-lg"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Customer Email"
            className="w-full px-3 py-2 border rounded-lg"
            value={formData.customer_email}
            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Job Title"
            className="w-full px-3 py-2 border rounded-lg"
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Proposal
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