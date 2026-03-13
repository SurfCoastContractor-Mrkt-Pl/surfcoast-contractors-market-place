import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

import EnhancedHeroSection from '@/components/home/EnhancedHeroSection';
import TradeCategories from '@/components/home/TradeCategories';
import FeaturedContractors from '@/components/home/FeaturedContractors';
import RecentJobs from '@/components/home/RecentJobs';
import CTASection from '@/components/home/CTASection';
import ContractorSearchFilter from '@/components/home/ContractorSearchFilter';
import JobFeedFilter from '@/components/home/JobFeedFilter';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import HowItWorks from '@/components/home/HowItWorks';
import TrustAndSocialProof from '@/components/home/TrustAndSocialProof';
import EmailCapturePopup from '@/components/home/EmailCapturePopup';
import HomeschoolPromoPopup from '@/components/home/HomeschoolPromoPopup';
import DemoProfiles from '@/components/home/DemoProfiles';
import RecentActivityBanner from '@/components/home/RecentActivityBanner';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState({});


  // Redirect authenticated users to their dashboard if they're new
  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return; // Not logged in, show homepage

        const user = await base44.auth.me();
        if (!user) return;

        // Check if contractor
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors && contractors.length > 0) {
          navigate(createPageUrl('ContractorAccount'));
          return;
        }

        // Check if customer profile exists
        const profiles = await base44.entities.CustomerProfile.filter({ email: user.email });
        if (!profiles || profiles.length === 0) {
          navigate(createPageUrl('CustomerAccount'));
          return;
        }
      } catch (error) {
        // User not authenticated or error checking auth, allow homepage to display
        console.warn('Auth check failed on homepage:', error.message);
        return;
      }
    };

    checkAndRedirect();
  }, [navigate]);

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['contractors-all'],
    queryFn: () => base44.entities.Contractor.filter({ available: true }, '-rating', 50),
  });

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs-recent'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date', 4),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['contractors-all'] });
    await queryClient.invalidateQueries({ queryKey: ['jobs-recent'] });
    await refetchJobs();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen">
      <EnhancedHeroSection />
      <TrustAndSocialProof />
      <EmailCapturePopup />
      <RecentActivityBanner />
      <DemoProfiles />
      <TradeCategories />
      <HomeschoolPromoPopup />
      <FeaturedContractors contractors={contractors?.slice(0, 6)} isLoading={contractorsLoading} />
      <RecentJobs jobs={jobs} isLoading={jobsLoading} />

      {/* Expandable Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {/* How It Works */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('howItWorks')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">How It Works</span>
            {expandedSections['howItWorks'] ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
          {expandedSections['howItWorks'] && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <HowItWorks />
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('cta')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Ready to Get Started?</span>
            {expandedSections['cta'] ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
          {expandedSections['cta'] && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <CTASection />
            </div>
          )}
        </div>

        {/* Job Feed with Filters */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('jobFeed')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Browse All Jobs</span>
            {expandedSections['jobFeed'] ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
          {expandedSections['jobFeed'] && jobs && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <JobFeedFilter jobs={jobs} />
            </div>
          )}
        </div>

        {/* Contractor Search */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('search')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Search All Contractors</span>
            {expandedSections['search'] ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
          {expandedSections['search'] && contractors && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <ContractorSearchFilter contractors={contractors} />
            </div>
          )}
        </div>

        {/* Newsletter */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('newsletter')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Subscribe to Updates</span>
            {expandedSections['newsletter'] ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
          {expandedSections['newsletter'] && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <NewsletterSignup />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}