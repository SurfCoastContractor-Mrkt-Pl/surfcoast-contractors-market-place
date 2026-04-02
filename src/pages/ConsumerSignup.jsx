import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EarlyAdopterBanner from '@/components/home/EarlyAdopterBanner';

export default function ConsumerSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
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

    base44.analytics.track({ eventName: 'consumer_signup_submitted' });

    try {
      // Validate required fields
      if (!formData.full_name.trim()) throw new Error('Full name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.password.trim()) throw new Error('Password is required');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.location.trim()) throw new Error('City/Zip is required');

      // Create consumer tier profile
      const consumerTier = await base44.entities.ConsumerTier.create({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        tier_level: 'bronze',
      });

      if (!consumerTier) {
        throw new Error('Failed to create consumer profile');
      }

      // Check and grant early adopter status
      const earlyAdopterRes = await base44.functions.invoke('grantEarlyAdopterWaiver', {
        email: formData.email,
        full_name: formData.full_name,
        signup_type: 'consumer',
      });

      base44.analytics.track({
        eventName: 'consumer_signup_success',
        properties: { 
          location: formData.location,
          early_adopter: earlyAdopterRes?.data?.qualified ?? false,
        },
      });

      // Redirect to consumer hub
      navigate(createPageUrl('ConsumerHub'));
    } catch (err) {
      base44.analytics.track({ eventName: 'consumer_signup_failed', properties: { reason: err.message } });
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Shop at Local Markets</h1>
            <p className="text-sm text-muted-foreground">Create your account to browse booths and vendors</p>
          </div>
        </div>
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
              <Label htmlFor="location">City / Zip Code *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, State or Zip Code"
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
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin()}
                className="font-semibold hover:underline"
                style={{ color: '#d4a843', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Login here
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}