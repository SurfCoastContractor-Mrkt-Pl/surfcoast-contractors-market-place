import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Star, MapPin, DollarSign, Shield, TrendingUp, Zap } from 'lucide-react';
import TrialStatusBadge from '@/components/trial/TrialStatusBadge';
import TrialDetailsCard from '@/components/trial/TrialDetailsCard';
import OnboardingWalkthrough from '@/components/trial/OnboardingWalkthrough';
import FeatureCard from '@/components/trial/FeatureCard';

export default function ContractorTrialDashboard() {
  const [contractor, setContractor] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractor = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate('/BecomeContractor');
          return;
        }

        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors.length > 0) {
          setContractor(contractors[0]);
        } else {
          navigate('/BecomeContractor');
        }
      } catch (error) {
        console.error('Error fetching contractor:', error);
        navigate('/BecomeContractor');
      }
    };

    fetchContractor();
  }, [navigate]);

  if (!contractor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: Briefcase,
      title: 'Browse Quality Jobs',
      description: 'Access verified job listings from clients in your area.',
    },
    {
      icon: Users,
      title: 'Connect with Clients',
      description: 'Message clients directly and negotiate project details.',
    },
    {
      icon: DollarSign,
      title: 'Set Your Own Rates',
      description: 'Control your pricing with hourly or fixed-rate options.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Get paid safely via Stripe with verified transaction tracking.',
    },
    {
      icon: Star,
      title: 'Build Your Reputation',
      description: 'Earn verified reviews and badges from completed jobs.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Access analytics, portfolio tools, and marketing resources.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWalkthrough userType="contractor" onDismiss={() => setShowWalkthrough(false)} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-foreground">Welcome to SurfCoast, {contractor.name}!</h1>
            <TrialStatusBadge
              trialEndDate={contractor.trial_ends_at}
              isFoundingMember={contractor.is_founding_member}
            />
          </div>
          <p className="text-lg text-muted-foreground">
            Your trial is active. Start browsing jobs, building your profile, and connecting with clients.
          </p>
        </div>

        {/* Trial Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <TrialDetailsCard
              isFoundingMember={contractor.is_founding_member}
              trialEndDate={contractor.trial_ends_at}
              successfulReferrals={contractor.successful_referral_count || 0}
            />
          </div>

          {/* Quick Links */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/ContractorAccount"
                className="block px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
              >
                Complete Profile
              </a>
              <a
                href="/Jobs"
                className="block px-4 py-2.5 rounded-lg bg-secondary/10 text-secondary font-semibold hover:bg-secondary/20 transition-colors"
              >
                Browse Jobs
              </a>
              <a
                href="/ContractorServices"
                className="block px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 font-semibold transition-colors"
              >
                Set Services
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
                  <span className="font-semibold text-foreground">1. Finish Your Profile</span> — Add photos,
                  bio, and rates so clients can find you.
                </li>
                <li>
                  <span className="font-semibold text-foreground">2. Start Bidding on Jobs</span> — Browse
                  available projects and submit proposals.
                </li>
                <li>
                  <span className="font-semibold text-foreground">3. Complete & Build Reputation</span> — 
                  Finish projects and earn verified reviews.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}