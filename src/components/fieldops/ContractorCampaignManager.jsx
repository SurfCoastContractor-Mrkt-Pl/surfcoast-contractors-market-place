import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import useTierAccess from '@/hooks/useTierAccess';

export default function ContractorCampaignManager({ contractorEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaign_name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_audience: '',
  });

  const queryClient = useQueryClient();
  const { tier } = useTierAccess(contractorEmail);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', contractorEmail],
    queryFn: () => base44.entities.ContractorCampaign.filter({ contractor_email: contractorEmail }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContractorCampaign.create({
      contractor_email: contractorEmail,
      ...data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', contractorEmail] });
      setIsOpen(false);
      setFormData({ campaign_name: '', description: '', start_date: '', end_date: '', target_audience: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ContractorCampaign.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', contractorEmail] });
      setIsOpen(false);
      setEditingCampaign(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContractorCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', contractorEmail] });
    },
  });

  const handleSubmit = () => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const canCreateCampaign = tier?.maxActiveCampaigns === -1 || campaigns.filter(c => c.status === 'active').length < tier?.maxActiveCampaigns;

  if (isLoading) return <div className="text-center py-8">Loading campaigns...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Marketing Campaigns</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateCampaign} onClick={() => setEditingCampaign(null)}>
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Campaign name"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              />
              <Textarea
                placeholder="Campaign description and goals"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
              <Textarea
                placeholder="Target audience description"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              />
              <Button onClick={handleSubmit} className="w-full">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{campaign.campaign_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCampaign(campaign);
                      setFormData(campaign);
                      setIsOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(campaign.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Leads</p>
                  <p className="font-semibold">{campaign.leads_generated || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jobs Booked</p>
                  <p className="font-semibold">{campaign.jobs_booked || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold">${campaign.revenue_generated || 0}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {campaign.start_date} to {campaign.end_date} • Status: <span className="font-medium">{campaign.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">No campaigns yet. Create one to track your marketing efforts.</p>
        </Card>
      )}
    </div>
  );
}