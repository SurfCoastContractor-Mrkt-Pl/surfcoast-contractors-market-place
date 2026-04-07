import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, CheckCircle2, MessageSquare, DollarSign, Award, Zap, Lock } from 'lucide-react';
import TrialStatusBadge from '@/components/trial/TrialStatusBadge';
import TrialDetailsCard from '@/components/trial/TrialDetailsCard';
import OnboardingWalkthrough from '@/components/trial/OnboardingWalkthrough';
import FeatureCard from '@/components/trial/FeatureCard';

export default function CustomerTrialDashboard() {
  const [customer, setCustomer] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate('/CustomerSignup');
          return;
        }

        const customers = await base44.entities.CustomerProfile.filter({ email: user.email });
        if (customers.length > 0) {
          setCustomer(customers[0]);
        } else {
          navigate('/CustomerSignup');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        navigate('/CustomerSignup');
      }
    };

    fetchCustomer();
  }, [navigate]);

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!customer) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const features = [
    {
      icon: Search,
      title: 'Find Verified Professionals',
      description: 'Browse verified tradespeople with real reviews and credentials.',
    },
    {
      icon: FileText,
      title: 'Post Jobs Instantly',
      description: 'Describe your project and receive competitive quotes from qualified pros.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Message professionals securely within the platform.',
    },
    {
      icon: DollarSign,
      title: 'Secure Payments',
      description: 'Pay safely via Stripe with full transaction protection.',
    },
    {
      icon: CheckCircle2,
      title: 'Track Progress',
      description: 'Monitor project updates, photos, and completion in real-time.',
    },
    {
      icon: Award,
      title: 'Verified Reviews',
      description: 'Leave and read verified reviews from other clients.',
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <OnboardingWalkthrough userType="customer" onDismiss={() => setShowWalkthrough(false)} />

      <div style={{ maxWidth: 1280, margin: "0 auto", paddingLeft: 16, paddingRight: 16, paddingTop: 48, paddingBottom: 48 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: 0, fontStyle: "italic" }}>Welcome to SurfCoast, {customer.full_name}!</h1>
            <TrialStatusBadge
              trialEndDate={customer.trial_ends_at}
              isFoundingMember={customer.is_founding_member}
            />
          </div>
          <p className="text-lg text-muted-foreground">
            Your trial is active. Find trusted professionals, post jobs, and manage projects all in one place.
          </p>
        </div>

        {/* Trial Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <TrialDetailsCard
              isFoundingMember={customer.is_founding_member}
              trialEndDate={customer.trial_ends_at}
              successfulReferrals={customer.successful_referral_count || 0}
            />
          </div>

          {/* Quick Links */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/PostJob"
                className="block px-4 py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Post a Job
              </a>
              <a
                href="/FindContractors"
                className="block px-4 py-2.5 rounded-lg bg-secondary/10 text-secondary font-semibold hover:bg-secondary/20 transition-colors"
              >
                Find Professionals
              </a>
              <a
                href="/Dashboard"
                className="block px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 font-semibold transition-colors"
              >
                My Projects
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} availableInTrial={true} />
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-8">
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-foreground mb-2">Get Started in 3 Steps</h3>
              <ol className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">1. Browse Professionals</span> — Explore
                  verified tradespeople with real reviews and credentials.
                </li>
                <li>
                  <span className="font-semibold text-foreground">2. Post Your First Job</span> — Describe
                  your project and get competitive quotes instantly.
                </li>
                <li>
                  <span className="font-semibold text-foreground">3. Hire & Pay Securely</span> — Hire the
                  pro you trust and pay safely through the platform.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}