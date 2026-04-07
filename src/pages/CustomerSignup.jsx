import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EarlyAdopterBanner from '@/components/home/EarlyAdopterBanner';

export default function CustomerSignup() {
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

    base44.analytics.track({ eventName: 'customer_signup_submitted' });

    try {
      // Validate required fields
      if (!formData.full_name.trim()) throw new Error('Full name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.password.trim()) throw new Error('Password is required');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.location.trim()) throw new Error('City/Zip is required');

      // Call signup backend function
      const response = await base44.functions.invoke('customerSignup', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
      });

      if (!response.data?.success && response.data?.error) {
        throw new Error(response.data.error || 'Signup failed');
      }

      // Check and grant early adopter status
      const earlyAdopterRes = await base44.functions.invoke('grantEarlyAdopterWaiver', {
        email: formData.email,
        full_name: formData.full_name,
        signup_type: 'customer',
      });

      base44.analytics.track({
        eventName: 'customer_signup_success',
        properties: { 
          location: formData.location,
          early_adopter: earlyAdopterRes?.data?.qualified ?? false,
        },
      });

      // Redirect to customer dashboard
      navigate(createPageUrl('CustomerAccount'));
    } catch (err) {
      base44.analytics.track({ eventName: 'customer_signup_failed', properties: { reason: err.message } });
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#EBEBEC", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "44px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FBF5EC", border: "0.5px solid #D9B88A", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 3px 0px #5C3500", flexShrink: 0 }}>
            <Users style={{ width: 20, height: 20, color: "#5C3500" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 22, color: "#1A1A1B", margin: 0 }}>Find a Contractor</h1>
            <p style={{ fontSize: 13, color: "#555", marginTop: 3, fontStyle: "italic" }}>Create your client account to post jobs and hire</p>
          </div>
        </div>
        <EarlyAdopterBanner />
        <Card style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, boxShadow: "3px 3px 0px #5C3500", padding: 32 }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div style={{ padding: "12px 16px", background: "#FBF5EC", border: "0.5px solid #D9B88A", borderRadius: 8, fontSize: 13, color: "#5C3500", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontFamily: "monospace" }}>Error</p>
                  <p style={{ margin: "4px 0 0", fontStyle: "italic" }}>{error}</p>
                </div>
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
              className="w-full font-semibold mt-6 transition-all"
              style={{
                background: loading ? "#333" : "#1A1A1B",
                color: "#fff",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                minHeight: 44,
                borderRadius: 6,
                boxShadow: "3px 3px 0px #5C3500",
                border: "none",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p style={{ fontSize: 13, color: "#555", textAlign: "center", marginTop: 16 }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin()}
                style={{ fontFamily: "monospace", fontWeight: 700, color: "#5C3500", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontStyle: "italic" }}
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