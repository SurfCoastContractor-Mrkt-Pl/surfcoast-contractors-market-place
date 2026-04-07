import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Send, BarChart3, Pause } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CampaignManager({ contractorId, contractorEmail }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', contractorEmail],
    queryFn: () =>
      base44.entities.Campaign.filter({
        contractor_email: contractorEmail
      })
  });

  const createMutation = useMutation({
    mutationFn: (campaign) =>
      base44.entities.Campaign.create({
        ...campaign,
        contractor_id: contractorId,
        contractor_email: contractorEmail
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', contractorEmail] });
      setShowForm(false);
      setFormData(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData) {
      createMutation.mutate(formData);
    }
  };

  const statusColor = {
    draft: 'bg-slate-100 text-slate-700',
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    paused: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-6">
            Create email, SMS, and social media campaigns to reach your clients.
          </p>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg mb-6 space-y-4">
              <input
                type="text"
                placeholder="Campaign Name"
                value={formData?.campaign_name || ''}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <select
                value={formData?.campaign_type || 'email'}
                onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="email">Email Campaign</option>
                <option value="sms">SMS Campaign</option>
                <option value="social_media">Social Media</option>
                <option value="seasonal">Seasonal Promotion</option>
              </select>
              <select
                value={formData?.target_audience || 'existing_clients'}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="existing_clients">Existing Clients</option>
                <option value="past_clients">Past Clients</option>
                <option value="website_visitors">Website Visitors</option>
              </select>
              <textarea
                placeholder="Campaign Message"
                value={formData?.message || ''}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {!showForm && (
            <Button
              onClick={() => {
                setFormData({
                  campaign_name: '',
                  campaign_type: 'email',
                  target_audience: 'existing_clients',
                  message: '',
                  status: 'draft'
                });
                setShowForm(true);
              }}
              className="mb-6 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          )}

          {/* Campaign List */}
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{campaign.campaign_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${statusColor[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{campaign.message}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Type: {campaign.campaign_type}</span>
                      <span>Audience: {campaign.target_audience}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Pause className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}