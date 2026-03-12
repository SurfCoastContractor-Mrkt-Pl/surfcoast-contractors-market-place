import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { RotateCw, ChevronDown, ChevronUp } from 'lucide-react';

import EnhancedHeroSection from '@/components/home/EnhancedHeroSection';
import TradeCategories from '@/components/home/TradeCategories';
import FeaturedContractors from '@/components/home/FeaturedContractors';
import RecentJobs from '@/components/home/RecentJobs';
import CTASection from '@/components/home/CTASection';
import ContractorSearchFilter from '@/components/home/ContractorSearchFilter';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import HowItWorks from '@/components/home/HowItWorks';
import TrustAndSocialProof from '@/components/home/TrustAndSocialProof';
import EmailCapturePopup from '@/components/home/EmailCapturePopup';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();


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
        // User not authenticated, allow homepage to display
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

  return (
    <div className="min-h-screen">
      {/* Refresh Button */}
      <div className="fixed top-20 right-4 z-40 sm:top-auto sm:bottom-6 sm:right-6">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="gap-2 rounded-full shadow-lg hover:shadow-xl"
          title="Refresh homepage data"
        >
          <RotateCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <EnhancedHeroSection />
      <TrustAndSocialProof />
      <EmailCapturePopup />
      <TradeCategories />
      <FeaturedContractors contractors={contractors?.slice(0, 6)} isLoading={contractorsLoading} />
      <RecentJobs jobs={jobs} isLoading={jobsLoading} />
    </div>
  );
}