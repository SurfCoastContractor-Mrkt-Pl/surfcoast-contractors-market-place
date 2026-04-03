import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Zap, Lock, DollarSign, Heart } from 'lucide-react';

export default function RecommendedJobs({ contractor, user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCommAccess, setHasCommAccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all open jobs
        const allJobs = await base44.entities.Job.filter({ status: 'open' });
        
        // Filter for matching trade and location
        const recommended = allJobs.filter(job => {
          const tradeMatch = contractor.trade_specialty === job.trade_needed || job.contractor_type_needed === 'general';
          const locationMatch = job.location && contractor.location && 
            job.location.toLowerCase().includes(contractor.location.toLowerCase());
          return tradeMatch && locationMatch;
        });
        
        setJobs(recommended || []);

        // Check if contractor has communication access (paid or subscription)
        const payments = await base44.entities.Payment.filter({
          payer_email: user.email,
          status: 'confirmed'
        });
        
        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email,
          status: 'active'
        });

        setHasCommAccess((payments?.length > 0) || (subscriptions?.length > 0));
      } catch (error) {
        console.error('Error loading recommended jobs:', error);
      }
      setLoading(false);
    };
    load();
  }, [contractor, user.email]);

  const handleExpressInterest = async (job) => {
    if (!hasCommAccess) {
      // Redirect to payment gate for limited communication
      const sessionId = `limited_comm_${job.id}_${Date.now()}`;
      const priceId = process.env.REACT_APP_STRIPE_LIMITED_COMM_PRICE_ID || '';
      
      // Show pricing modal or redirect to checkout
      alert(`Express interest requires communication access. Pay $1.50 for 10-minute conversation or subscribe.`);
      return;
    }

    try {
      // Create job interest notification and send email
      await base44.entities.JobNotification.create({
        job_id: job.id,
        contractor_id: contractor.id,
        contractor_email: user.email,
        job_title: job.title,
        match_score: 85, // placeholder
        match_reason: `Matches your ${contractor.trade_specialty || 'trade'} specialty in ${contractor.location}`,
      });

      alert('Interest expressed! The job poster will be notified.');
    } catch (error) {
      console.error('Error expressing interest:', error);
      alert('Failed to express interest. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Finding jobs for you...
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Zap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No matching jobs found</p>
        <p className="text-slate-600 text-sm mt-1">We'll notify you when jobs match your trade and location</p>
      </div>
    );
  }

  return (
    <div className="px-4 mt-4 pb-6 space-y-3">
      {/* Communication Access Banner */}
      {!hasCommAccess && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold text-sm">Communication Required</p>
            <p className="text-amber-300/80 text-xs mt-0.5">Pay $1.50 for a 10-minute conversation or subscribe to express interest</p>
          </div>
        </div>
      )}

      {jobs.map(job => (
        <div
          key={job.id}
          className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Recommended Match</span>
              </div>
              <p className="text-white font-semibold text-base">{job.title}</p>
              <p className="text-slate-400 text-sm mt-0.5">{job.poster_name}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {job.location && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </div>
            )}
            {job.budget_max && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <DollarSign className="w-3.5 h-3.5" />
                ${job.budget_min || 0} - ${job.budget_max}
              </div>
            )}
          </div>

          <button
            onClick={() => handleExpressInterest(job)}
            disabled={!hasCommAccess}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              hasCommAccess
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {hasCommAccess ? '💬 Express Interest' : '🔒 Unlock to Express Interest'}
          </button>
        </div>
      ))}
    </div>
  );
}