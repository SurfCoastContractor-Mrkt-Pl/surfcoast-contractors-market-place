import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Zap } from 'lucide-react';
import PricingTierCard from '@/components/subscription/PricingTierCard';

const WAVE_TIERS = [
  {
    tier: 'starter',
    price: 1900,
    priceId: process.env.REACT_APP_STRIPE_STARTER_PRICE_ID || 'price_starter',
    features: [
      'Browse job listings',
      'Submit proposals',
      'Basic messaging',
      'Profile management',
      'Up to 5 active jobs/month',
    ],
  },
  {
    tier: 'pro',
    price: 3900,
    priceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      'Everything in Starter',
      'Unlimited job proposals',
      'Priority job listings',
      'Advanced analytics',
      'Up to 15 active jobs/month',
    ],
  },
  {
    tier: 'max',
    price: 5900,
    priceId: process.env.REACT_APP_STRIPE_MAX_PRICE_ID || 'price_max',
    features: [
      'Everything in Pro',
      'Unlimited active jobs',
      'Marketing tools',
      'Team management',
      'Custom branding',
    ],
  },
  {
    tier: 'premium',
    price: 10000,
    priceId: process.env.REACT_APP_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    features: [
      'Everything in Max',
      'Dedicated support',
      'API access',
      'Advanced scheduling',
      'Payment processing tools',
    ],
  },
  {
    tier: 'residential',
    price: 12500,
    priceId: process.env.REACT_APP_STRIPE_RESIDENTIAL_PRICE_ID || 'price_residential',
    features: [
      'Everything in Premium',
      'White-label options',
      'Custom integrations',
      'Priority onboarding',
      'Quarterly business review',
    ],
  },
];

export default function SubscriptionUpgrade() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/');
          return;
        }
        setUser(currentUser);

        const subs = await base44.entities.Subscription.filter({ user_email: currentUser.email });
        if (subs.length > 0) {
          setSubscription(subs[0]);
          setSelectedTier(subs[0].tier);
        }
      } catch (err) {
        console.error('Error fetching user/subscription:', err);
        setError('Failed to load subscription info');
      }
    };

    fetchData();
  }, [navigate]);

  const handleSelectTier = async (tier, price) => {
    if (subscription && subscription.tier === tier) return;

    setLoading(true);
    setError(null);

    try {
      // Call backend to create checkout session
      const response = await base44.functions.invoke('createSubscriptionCheckout', {
        tier,
        priceId: WAVE_TIERS.find((t) => t.tier === tier)?.priceId,
        userEmail: user.email,
        userType: user.role === 'contractor' ? 'contractor' : 'customer',
      });

      if (response.data?.checkoutUrl) {
        // Check if in iframe
        if (window.self !== window.top) {
          setError('Checkout must be completed from the published app. Please visit the full website.');
          setLoading(false);
          return;
        }
        window.location.href = response.data.checkoutUrl;
      } else {
        setError('Failed to initiate checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 16px 0", fontStyle: "italic" }}>Your Trial Has Expired</h1>
          <p style={{ fontSize: 18, color: T.muted, marginBottom: 24, fontStyle: "italic" }}>
            Subscribe to continue using SurfCoast and unlock all features.
          </p>

          {subscription ? (
            <div className="inline-block bg-secondary/10 border-2 border-secondary rounded-lg px-6 py-3">
              <p className="text-secondary font-semibold">
                Current Plan: <span className="capitalize">{subscription.tier}</span> (${(subscription.amount_cents / 100).toFixed(2)}/mo)
              </p>
            </div>
          ) : (
            <div className="inline-block bg-primary/10 border-2 border-primary rounded-lg px-6 py-3">
              <p className="text-primary font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                No active subscription
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive font-semibold">Error</p>
              <p className="text-destructive/90 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {WAVE_TIERS.map((tierData) => (
            <PricingTierCard
              key={tierData.tier}
              tier={tierData.tier}
              price={tierData.price}
              features={tierData.features}
              isSelected={selectedTier === tierData.tier}
              onSelect={handleSelectTier}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-card border-2 border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">All Tiers Include:</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>✓ Verified professional profiles</li>
                <li>✓ Secure messaging & payments</li>
                <li>✓ Project tracking</li>
                <li>✓ Review & ratings system</li>
                <li>✓ Email support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Higher Tiers Add:</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>✓ Advanced analytics & reporting</li>
                <li>✓ Unlimited job management</li>
                <li>✓ Priority support & listings</li>
                <li>✓ Marketing & branding tools</li>
                <li>✓ API access & integrations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}