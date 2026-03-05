import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, HelpCircle } from 'lucide-react';

const TRADES = [
  'electrician', 'plumber', 'carpenter', 'hvac', 'mason', 'roofer',
  'painter', 'welder', 'tiler', 'landscaper', 'other'
];

const TRADE_LABELS = {
  electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter',
  hvac: 'HVAC Technician', mason: 'Mason', roofer: 'Roofer', painter: 'Painter',
  welder: 'Welder', tiler: 'Tiler', landscaper: 'Landscaper', other: 'Other'
};

export default function CustomerProfileEditor({ profile, userEmail, onAskAgent }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    location: '',
    bio: '',
    preferred_contractor_types: [],
    preferred_trades: [],
  });
  const [dobError, setDobError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        preferred_contractor_types: profile.preferred_contractor_types || [],
        preferred_trades: profile.preferred_trades || [],
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.CustomerProfile.update(profile.id, data);
      } else {
        return base44.entities.CustomerProfile.create({
          email: userEmail,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile', userEmail] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!formData.location.trim()) {
      alert('Please enter your location');
      return;
    }
    updateMutation.mutate(formData);
  };

  const toggleContractorType = (type) => {
    setFormData(prev => ({
      ...prev,
      preferred_contractor_types: prev.preferred_contractor_types.includes(type)
        ? prev.preferred_contractor_types.filter(t => t !== type)
        : [...prev.preferred_contractor_types, type]
    }));
  };

  const toggleTrade = (trade) => {
    setFormData(prev => ({
      ...prev,
      preferred_trades: prev.preferred_trades.includes(trade)
        ? prev.preferred_trades.filter(t => t !== trade)
        : [...prev.preferred_trades, trade]
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Profile Setup</h2>
          <p className="text-sm text-slate-500 mt-1">Complete your profile to get started</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAskAgent}
          className="gap-1.5 text-amber-600 hover:bg-amber-50"
        >
          <HelpCircle className="w-4 h-4" />
          Need Help?
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                placeholder="Tell contractors about your project style and preferences..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Contractor Preferences</h3>
          
          <div className="mb-5">
            <Label className="text-sm font-medium text-slate-900 mb-3 block">
              Preferred Contractor Types
            </Label>
            <div className="space-y-2">
              {['general', 'trade_specific'].map(type => (
                <div key={type} className="flex items-center">
                  <Checkbox
                    id={`type-${type}`}
                    checked={formData.preferred_contractor_types.includes(type)}
                    onCheckedChange={() => toggleContractorType(type)}
                    className="rounded"
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="ml-3 text-sm text-slate-700 cursor-pointer"
                  >
                    {type === 'general' ? 'General Contractors' : 'Trade Specialists'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-900 mb-3 block">
              Preferred Trade Specialties
            </Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {TRADES.map(trade => (
                <div key={trade} className="flex items-center">
                  <Checkbox
                    id={`trade-${trade}`}
                    checked={formData.preferred_trades.includes(trade)}
                    onCheckedChange={() => toggleTrade(trade)}
                    className="rounded"
                  />
                  <label
                    htmlFor={`trade-${trade}`}
                    className="ml-3 text-sm text-slate-700 cursor-pointer"
                  >
                    {TRADE_LABELS[trade]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>

        {updateMutation.isSuccess && (
          <p className="text-sm text-green-600 text-center font-medium">✓ Profile saved successfully!</p>
        )}
      </form>
    </Card>
  );
}