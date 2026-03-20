import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Award } from 'lucide-react';

const TIER_COLORS = {
  bronze: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-900' },
  silver: { bg: 'bg-slate-50', border: 'border-slate-300', badge: 'bg-slate-100 text-slate-900' },
  gold: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-900' }
};

const TIER_INFO = {
  bronze: {
    name: 'Bronze',
    range: '$0 - $15,000',
    fee: '2%',
    description: 'Get started risk-free with our lowest fee tier'
  },
  silver: {
    name: 'Silver',
    range: '$15,000 - $50,000',
    fee: '10%',
    description: 'Growing professionals earn more, keep more'
  },
  gold: {
    name: 'Gold',
    range: '$50,000+',
    fee: '15%',
    description: 'Our most trusted, established professionals'
  }
};

export default function ContractorTierDashboard({ contractorId, contractorEmail }) {
  const [tierData, setTierData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTierData();
  }, [contractorId]);

  const loadTierData = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const tiers = await base44.entities.ContractorTier.filter({
        contractor_id: contractorId,
        year: currentYear
      });
      setTierData(tiers?.[0] || null);
    } catch (err) {
      console.error('Failed to load tier data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse h-24 bg-slate-200 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!tierData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No tier data available yet. Complete your first job to get started!</AlertDescription>
      </Alert>
    );
  }

  const info = TIER_INFO[tierData.current_tier];
  const colors = TIER_COLORS[tierData.current_tier];
  const annualEarningsDisplay = (tierData.annual_earnings / 100).toFixed(2);
  const earnedToNextTierDisplay = (tierData.earnings_to_next_tier / 100).toFixed(2);

  // Calculate progress to next tier
  let progressPercent = 0;
  if (tierData.current_tier === 'bronze') {
    progressPercent = (tierData.annual_earnings / 1500000) * 100;
  } else if (tierData.current_tier === 'silver') {
    progressPercent = ((tierData.annual_earnings - 1500000) / (5000000 - 1500000)) * 100;
  } else {
    progressPercent = 100;
  }

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className={`border-2 ${colors.border}`}>
        <CardHeader className={colors.bg}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-600" />
              <div>
                <CardTitle className="text-2xl">{info.name} Tier</CardTitle>
                <CardDescription>Earning range: {info.range}</CardDescription>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${colors.badge} font-semibold text-lg`}>
              {tierData.current_facilitation_fee}% Fee
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-slate-700 mb-4">{info.description}</p>
          
          {/* Tier Change Notification */}
          {tierData.previous_tier && tierData.tier_changed_at && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-900 mb-4">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Congratulations! You've been promoted to {info.name} tier on{' '}
                {new Date(tierData.tier_changed_at).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Earnings Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Earnings</CardTitle>
          <CardDescription>Annual earnings and progress to next tier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Earnings Display */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">2025 Earnings</p>
              <p className="text-2xl font-bold text-slate-900">${annualEarningsDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Lifetime Earnings</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(tierData.lifetime_earnings / 100).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {tierData.current_tier !== 'gold' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-slate-700">Progress to Next Tier</p>
                <p className="text-sm text-slate-600">${earnedToNextTierDisplay} to go</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{progressPercent.toFixed(0)}% complete</p>
            </div>
          )}

          {tierData.current_tier === 'gold' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-900 font-medium">🎉 You've reached Gold Tier!</p>
              <p className="text-xs text-yellow-800 mt-1">
                Enjoy the lowest facilitation fee we offer at 15%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Structure</CardTitle>
          <CardDescription>How our sliding scale works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(TIER_INFO).map(([tier, data]) => (
              <div
                key={tier}
                className={`p-4 rounded-lg border ${
                  tierData.current_tier === tier
                    ? `${TIER_COLORS[tier].bg} ${TIER_COLORS[tier].border} border-2 bg-opacity-100`
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">{data.name}</p>
                    <p className="text-sm text-slate-600">{data.range}</p>
                  </div>
                  <p className="font-bold text-lg text-slate-900">{data.fee}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Tier is calculated based on your annual earnings and updates automatically when you complete jobs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}