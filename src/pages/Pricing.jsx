import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Pricing() {
  const [hoveredTier, setHoveredTier] = useState(null);
  const [loading, setLoading] = useState(false);

  const waveFoTiers = [
    {
      name: 'Wave Starter',
      price: 19,
      period: '/month',
      description: 'For new contractors',
      planKey: 'wave_starter',
      features: [
        'Job scheduling (up to 5)',
        'Basic invoicing (10/month)',
        'Text messaging',
        'Mobile app access',
        'Basic customer portal'
      ]
    },
    {
      name: 'Wave Pro',
      price: 39,
      period: '/month',
      description: 'For growing contractors',
      planKey: 'wave_pro',
      features: [
        'Unlimited jobs & invoicing',
        'Lead tracking',
        'Document storage (1GB)',
        'Email workflows',
        'Basic inventory (50 items)'
      ]
    },
    {
      name: 'Wave Max',
      price: 59,
      period: '/month',
      description: 'For established contractors',
      planKey: 'wave_max',
      highlighted: true,
      features: [
        'Project tracking & reporting',
        'Advanced analytics',
        'Document storage (5GB)',
        'AI-assisted scheduling',
        'QuickBooks integration'
      ]
    },
    {
      name: 'Wave FO Premium',
      price: 100,
      period: '/month',
      description: 'For licensed contractors',
      planKey: 'wave_fo_premium',
      features: [
        'Everything in Wave Max',
        'Team management',
        'CSLB compliance tools',
        'Priority support',
        'Enterprise integrations'
      ]
    },
    {
      name: 'Wave Residential Bundle',
      price: 125,
      period: '/month',
      description: 'Premium with unlimited communication',
      planKey: 'wave_residential_bundle',
      features: [
        'Everything in Wave FO Premium',
        'Unlimited messaging',
        'Advanced customer portal',
        'Two-way QuickBooks sync',
        'Dedicated support'
      ]
    }
  ];

  const waveShopTier = {
    name: 'WAVEShop Market Vendor',
    price: 35,
    period: '/month',
    description: 'For farmers market & swap meet vendors',
    planKey: 'waveshop',
    features: [
      'Booth management',
      'Inventory tracking',
      'Payment processing',
      'Customer reviews',
      'Marketing tools'
    ]
  };

  const handleGetStarted = async (planKey) => {
    if (window.self !== window.top) {
      alert('Checkout only works from a published app. Please visit the app URL directly.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createWaveFOSubscription', { planKey });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error starting checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif", background: '#0a1628' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.72)', zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '44px' }}>
        <button onClick={() => window.history.back()} style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
          <h1 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1, margin: 0 }}>Pricing</h1>
        </div>
        <div style={{ width: '60px' }} />
      </header>

      <main style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', width: '100%', flex: 1 }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '680px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '800', color: '#ffffff', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
            Choose the plan that fits your business. All plans include a 2-week free trial.
          </p>
        </section>

        {/* WAVE FO Tiers */}
        <section style={{ width: '100%', maxWidth: '1400px', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            WAVE FO - For Contractors
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {waveFoTiers.map((tier, idx) => (
              <article
                key={idx}
                onMouseEnter={() => setHoveredTier(`wave-${idx}`)}
                onMouseLeave={() => setHoveredTier(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  padding: '28px 20px',
                  backdropFilter: 'blur(18px)',
                  transition: 'all 0.22s ease',
                  cursor: 'default',
                  background: tier.highlighted ? 'rgba(217,119,6,0.1)' : 'rgba(10,22,40,0.5)',
                  border: tier.highlighted ? '2px solid #d97706' : '1px solid rgba(217,119,6,0.3)',
                  transform: hoveredTier === `wave-${idx}` ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredTier === `wave-${idx}`
                    ? '0 0 32px rgba(217,119,6,0.4), 0 12px 32px rgba(217,119,6,0.2)'
                    : '0 4px 16px rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                {tier.highlighted && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#d97706', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Most Popular
                  </div>
                )}
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px' }}>
                  {tier.name}
                </h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {tier.description}
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: '#d97706' }}>
                    ${tier.price}
                  </span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    {tier.period}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Month-to-month · No setup fees · Cancel anytime
                </p>
                <button
                  onClick={() => handleGetStarted(tier.planKey)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    minHeight: '40px',
                    background: '#d97706',
                    color: '#fff',
                    marginBottom: '16px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Loading...' : 'Get Started'}
                </button>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                      <Check size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* WAVEShop Tier */}
        <section style={{ width: '100%', maxWidth: '1400px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            WAVEShop - For Vendors
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <article
              onMouseEnter={() => setHoveredTier('waveshop')}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                padding: '28px 20px',
                backdropFilter: 'blur(18px)',
                transition: 'all 0.22s ease',
                cursor: 'default',
                background: 'rgba(157,122,84,0.1)',
                border: '2px solid #9d7a54',
                transform: hoveredTier === 'waveshop' ? 'translateY(-4px)' : 'none',
                boxShadow: hoveredTier === 'waveshop'
                  ? '0 0 32px rgba(157,122,84,0.4), 0 12px 32px rgba(157,122,84,0.2)'
                  : '0 4px 16px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px' }}>
                {waveShopTier.name}
              </h4>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.5 }}>
                {waveShopTier.description}
              </p>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#9d7a54' }}>
                  ${waveShopTier.price}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  {waveShopTier.period}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', lineHeight: 1.4 }}>
                Month-to-month · No setup fees · Cancel anytime
              </p>
              <button
                onClick={() => handleGetStarted(waveShopTier.planKey)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  minHeight: '40px',
                  background: '#9d7a54',
                  color: '#fff',
                  marginBottom: '16px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Loading...' : 'Get Started'}
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {waveShopTier.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                    <Check size={14} style={{ color: '#9d7a54', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>

      <footer style={{ position: 'relative', zIndex: 2, padding: '24px 16px', background: 'rgba(10,22,40,0.75)', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
          Questions? <a href="mailto:support@surfcoast.com" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Contact support</a>
        </p>
      </footer>
    </div>
  );
}