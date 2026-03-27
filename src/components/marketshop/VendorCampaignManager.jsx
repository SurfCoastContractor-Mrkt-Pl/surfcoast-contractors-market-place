import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Edit2, DollarSign, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export default function VendorCampaignManager({ shopId, shopEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    campaign_name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_audience: '',
    expected_revenue: '',
  });

  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', shopId],
    queryFn: () => base44.entities.MarketEventCampaign.filter({ market_shop_id: shopId }),
    enabled: !!shopId,
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.MarketEventCampaign.create({
        ...data,
        market_shop_id: shopId,
        market_shop_email: shopEmail,
        expected_revenue: parseFloat(data.expected_revenue) || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', shopId] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.MarketEventCampaign.update(editingId, {
        ...data,
        expected_revenue: parseFloat(data.expected_revenue) || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', shopId] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MarketEventCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', shopId] });
    },
  });

  const resetForm = () => {
    setFormData({
      campaign_name: '',
      description: '',
      start_date: '',
      end_date: '',
      target_audience: '',
      expected_revenue: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (campaign) => {
    setFormData({
      campaign_name: campaign.campaign_name,
      description: campaign.description || '',
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      target_audience: campaign.target_audience || '',
      expected_revenue: campaign.expected_revenue?.toString() || '',
    });
    setEditingId(campaign.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'planned':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-slate-100 text-slate-700';
      case 'paused':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Digital Sales Campaigns</h2>
          <p className="text-sm text-slate-500 mt-1">Create and track your promotional campaigns</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Campaign' : 'Create New Campaign'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Campaign Name"
                placeholder="e.g., Spring Collection Launch"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                required
              />
              <Input
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
              <Input
                label="Expected Revenue ($)"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.expected_revenue}
                onChange={(e) => setFormData({ ...formData, expected_revenue: e.target.value })}
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Describe your campaign..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Textarea
              label="Target Audience"
              placeholder="Who is this campaign targeting?"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              rows={2}
            />

            <div className="flex gap-3">
              <Button type="submit" variant="default" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Campaign'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="grid gap-4">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{campaign.campaign_name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-slate-600 mb-2">{campaign.description}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {format(new Date(campaign.start_date), 'MMM d, yyyy')} — {format(new Date(campaign.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(campaign)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(campaign.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                {campaign.target_audience && (
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs">Target Audience</p>
                    <p className="text-slate-900 font-medium">{campaign.target_audience}</p>
                  </div>
                )}
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Expected
                  </div>
                  <p className="text-slate-900 font-medium">${campaign.expected_revenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Actual
                  </div>
                  <p className="text-emerald-600 font-medium">${campaign.actual_revenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <ShoppingCart className="w-3 h-3" />
                    Sales
                  </div>
                  <p className="text-slate-900 font-medium">{campaign.total_sales || 0}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-slate-500">No campaigns yet. Create your first campaign to start tracking sales!</p>
          </Card>
        )}
      </div>
    </div>
  );
}