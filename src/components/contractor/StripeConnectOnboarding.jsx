import React, { useState } from 'react';
import { CheckCircle, Loader2, Shield, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StripeConnectOnboarding({ contractor, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConnected = contractor?.stripe_account_charges_enabled === true;

  if (isConnected) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628' }}>
        <div style={{ position: 'relative', zIndex: 2, background: 'rgba(10,22,40,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '20px', padding: '48px 40px', maxWidth: '480px', width: '90%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle style={{ width: '32px', height: '32px', color: '#4ade80' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px' }}>Bank Account Connected ✓</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: '1.6' }}>Your payout account is set up and ready to receive payments.</p>
          <button
            onClick={onComplete}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 24px rgba(74,222,128,0.3)' }}
          >
            Continue to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const handleConnect = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createStripeConnectOnboarding', {
        contractor_id: contractor.id
      });
      const url = response?.data?.onboardingUrl || response?.data?.loginLink;
      if (url) {
        window.location.href = url;
      } else {
        setError('Could not retrieve onboarding link. Please try again.');
      }
    } catch (err) {
      console.error('Stripe connect error:', err);
      setError('Failed to connect bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628', padding: '24px 16px' }}>
      <div style={{ position: 'relative', zIndex: 2, background: 'rgba(10,22,40,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px 36px', maxWidth: '520px', width: '100%' }}>
        
        {/* Icon */}
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(217,119,6,0.15)', border: '2px solid rgba(217,119,6,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Building2 style={{ width: '28px', height: '28px', color: '#d97706' }} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Connect Your Bank Account</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', fontWeight: '500' }}>Required to receive job payments</p>

        {/* Description */}
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', marginBottom: '24px' }}>
          SurfCoast uses Stripe to securely deposit your earnings. You'll receive <strong style={{ color: '#ffffff' }}>82% of every job payment</strong> directly to your bank within 2 business days.
        </p>

        {/* Green callout */}
        <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield style={{ width: '18px', height: '18px', color: '#4ade80', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#4ade80' }}>
            Your earnings are protected — SurfCoast never holds your money
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#fca5a5' }}>{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 24px rgba(217,119,6,0.35)', transition: 'all 0.2s' }}
        >
          {loading ? (
            <>
              <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 0.8s linear infinite' }} />
              Connecting...
            </>
          ) : (
            'Connect Bank Account via Stripe →'
          )}
        </button>

        {/* Cannot skip notice */}
        <p style={{ margin: '16px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          This step is required and cannot be skipped
        </p>
      </div>
    </div>
  );
}