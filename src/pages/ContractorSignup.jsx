import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, HardHat } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const trades = [
  'electrician', 'plumber', 'carpenter', 'hvac', 'mason', 'roofer', 'painter', 'welder', 'tiler', 'landscaper', 'other'
];

export default function ContractorSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    trade_specialty: '',
    location: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    base44.analytics.track({ eventName: 'contractor_signup_submitted' });

    try {
      // Validate required fields
      if (!formData.full_name.trim()) throw new Error('Full name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.password.trim()) throw new Error('Password is required');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.trade_specialty) throw new Error('Trade specialty is required');
      if (!formData.location.trim()) throw new Error('Service location is required');

      // Call signup backend function
      const response = await fetch('/functions/contractorSignup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          trade_specialty: formData.trade_specialty,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Check and grant early adopter status
      const earlyAdopterRes = await base44.functions.invoke('grantEarlyAdopterWaiver', {
        email: formData.email,
        full_name: formData.full_name,
        signup_type: 'contractor',
      });

      base44.analytics.track({
        eventName: 'contractor_signup_success',
        properties: {
          trade_specialty: formData.trade_specialty,
          location: formData.location,
          early_adopter: earlyAdopterRes.data.qualified,
        },
      });

      // Redirect to contractor onboarding
      navigate(createPageUrl('BecomeContractor'));
    } catch (err) {
      base44.analytics.track({ eventName: 'contractor_signup_failed', properties: { reason: err.message } });
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative py-14 text-white overflow-hidden" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(0,0,0,0.58)'}}></div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-xl flex items-center justify-center p-3" style={{backgroundColor: '#1E5A96'}}>
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Join SurfCoast as a Contractor</h1>
              <p className="text-white/75 mt-1">Build your verified profile with low fees starting at just 2%. We reward growth with a sliding scale.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <EarlyAdopterBanner />
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Your name"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 6 characters"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="trade">Trade Specialty *</Label>
              <Select value={formData.trade_specialty} onValueChange={(v) => handleChange('trade_specialty', v)}>
                <SelectTrigger id="trade" className="mt-1.5">
                  <SelectValue placeholder="Select your trade" />
                </SelectTrigger>
                <SelectContent>
                  {trades.map(trade => (
                    <SelectItem key={trade} value={trade}>
                      {trade.charAt(0).toUpperCase() + trade.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Service Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, State"
                required
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white font-semibold mt-6"
              style={{backgroundColor: '#1E5A96'}}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-sm text-slate-600 text-center mt-4">
              Already have an account?{' '}
              <Link to={createPageUrl('Home')} className="font-semibold hover:underline" style={{color: '#d4a843'}}>
                Login here
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}