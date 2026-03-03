import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

import HeroSection from '@/components/home/HeroSection';
import TradeCategories from '@/components/home/TradeCategories';
import FeaturedContractors from '@/components/home/FeaturedContractors';
import RecentJobs from '@/components/home/RecentJobs';
import CTASection from '@/components/home/CTASection';
import AgentChatModal from '@/components/agent/AgentChatModal';

export default function Home() {
  const [agentOpen, setAgentOpen] = useState(true);

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['contractors-featured'],
    queryFn: () => base44.entities.Contractor.filter({ available: true }, '-rating', 6),
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-recent'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date', 4),
  });

  return (
    <div className="min-h-screen">
      <AgentChatModal open={agentOpen} onClose={() => setAgentOpen(false)} />
      <HeroSection />
      <CTASection />
      <TradeCategories />
      <FeaturedContractors contractors={contractors} isLoading={contractorsLoading} />
      <RecentJobs jobs={jobs} isLoading={jobsLoading} />
    </div>
  );
}