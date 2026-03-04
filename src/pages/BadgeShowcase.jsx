import React, { useState } from 'react';
import ContractorBadges from '../components/badges/ContractorBadges';
import CustomerBadges from '../components/badges/CustomerBadges';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export default function BadgeShowcase() {
  const [contractorJobs, setContractorJobs] = useState(300);
  const [customerJobs, setCustomerJobs] = useState(300);

  const milestones = [0, 1, 3, 5, 10, 20, 50, 100, 150, 200, 300];

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Badge System Preview</h1>
          <p className="text-slate-500 mt-2">Sturdy, professional badge designs for SurfCoast Contractor Marketplace</p>
        </div>

        {/* Contractor Badges */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span className="text-sm font-semibold text-slate-700 mr-2">Contractor Jobs Completed:</span>
            <div className="flex flex-wrap gap-2">
              {milestones.map(m => (
                <button
                  key={m}
                  onClick={() => setContractorJobs(m)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    contractorJobs === m
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm font-bold text-amber-600">{contractorJobs} jobs</span>
          </div>
          <ContractorBadges completedJobsCount={contractorJobs} />
        </div>

        {/* Customer Badges */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span className="text-sm font-semibold text-slate-700 mr-2">Customer Jobs Completed:</span>
            <div className="flex flex-wrap gap-2">
              {milestones.map(m => (
                <button
                  key={m}
                  onClick={() => setCustomerJobs(m)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    customerJobs === m
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm font-bold text-amber-600">{customerJobs} jobs</span>
          </div>
          <CustomerBadges completedJobsCount={customerJobs} />
        </div>

        {/* Legend badge close-up */}
        <div className="bg-white rounded-xl border border-amber-300 shadow-lg p-8 text-center space-y-4"
          style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7, #fffbeb)' }}>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">The Pinnacle — Tier 10</div>
          <h2 className="text-2xl font-bold text-slate-900">SurfCoast Legend</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Awarded to contractors and customers who have completed <strong>300 verified jobs</strong> on the SurfCoast Marketplace. The ultimate mark of trust, dedication, and excellence.
          </p>
          <div className="flex justify-center mt-4">
            {/* Legend badge large display */}
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #b45309, #fbbf24)',
                  padding: 4,
                  borderRadius: '50%',
                  boxShadow: '0 0 32px 10px rgba(251,191,36,0.45)',
                }}
              />
              <div
                className="relative z-10 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  width: 110,
                  height: 110,
                  background: 'linear-gradient(145deg, #fef3c7, #fbbf24, #d97706)',
                }}
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/1984e69ad_IMG_8260.jpeg"
                  alt="SurfCoast Legend"
                  style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: '50%' }}
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-2 uppercase tracking-widest">300 Verified Jobs · Elite Status</div>
        </div>

      </div>
    </div>
  );
}