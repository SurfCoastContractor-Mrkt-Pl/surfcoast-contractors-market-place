import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target, Lock, Unlock } from 'lucide-react';

const MILESTONES = [
  { id: 1, label: 'First Steps', goal: 1, type: 'jobs', reward: '$10 bonus', icon: Star },
  { id: 2, label: 'Rising Star', goal: 5, type: 'jobs', reward: '$50 bonus + featured badge', icon: Zap },
  { id: 3, label: 'Trusted Pro', goal: 10, type: 'jobs', reward: '$100 bonus + premium listing', icon: Trophy },
  { id: 4, label: 'Master Craftsman', goal: 25, type: 'jobs', reward: '$250 bonus + priority support', icon: Trophy },
  { id: 5, label: 'Elite Status', goal: 50, type: 'jobs', reward: '$500 bonus + exclusive perks', icon: Star },
];

const RATING_BONUSES = [
  { rating: 4.8, bonus: '$25/month boost', icon: '⭐⭐⭐⭐⭐' },
  { rating: 4.5, bonus: '$15/month boost', icon: '⭐⭐⭐⭐' },
  { rating: 4.0, bonus: 'No penalty', icon: '⭐⭐⭐' },
];

export default function BonusesAndTierUnlocks({ contractorId, contractorEmail }) {
  const { data: contractor } = useQuery({
    queryKey: ['contractor', contractorId],
    queryFn: () => base44.entities.Contractor.filter({ email: contractorEmail }),
    enabled: !!contractorId && !!contractorEmail,
  });

  const { data: scopes } = useQuery({
    queryKey: ['scopes-bonuses', contractorId],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorId && !!contractorEmail,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews-bonuses', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const stats = useMemo(() => {
    if (!contractor || !scopes || !reviews) return null;

    const completedJobs = scopes.filter(s => s.status === 'closed').length;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
      : 0;

    return { completedJobs, avgRating };
  }, [contractor, scopes, reviews]);

  if (!stats) {
    return <Card className="p-6"><p className="text-slate-500">Loading bonuses...</p></Card>;
  }

  const unlockedMilestones = MILESTONES.filter(m => stats.completedJobs >= m.goal);
  const nextMilestone = MILESTONES.find(m => stats.completedJobs < m.goal);
  const progressToNext = nextMilestone
    ? Math.round((stats.completedJobs / nextMilestone.goal) * 100)
    : 100;

  const getRatingBonus = () => {
    const matching = RATING_BONUSES.find(b => stats.avgRating >= b.rating);
    return matching || RATING_BONUSES[RATING_BONUSES.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Performance Bonuses & Tier Unlocks</h2>
            <p className="text-sm text-slate-600 mt-1">Earn rewards as you hit milestones</p>
          </div>
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-600">Jobs Completed</p>
            <p className="text-2xl font-bold text-purple-600">{stats.completedJobs}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-600">Avg Rating</p>
            <p className="text-2xl font-bold text-amber-600">{stats.avgRating.toFixed(1)}⭐</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-600">Milestones</p>
            <p className="text-2xl font-bold text-green-600">{unlockedMilestones.length}</p>
          </div>
        </div>
      </Card>

      {/* Job Milestones */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Job Completion Milestones
        </h3>

        <div className="space-y-4">
          {MILESTONES.map((milestone, idx) => {
            const Icon = milestone.icon;
            const isUnlocked = stats.completedJobs >= milestone.goal;
            const isCurrent = nextMilestone?.id === milestone.id;

            return (
              <div key={milestone.id} className={`p-4 rounded-lg border ${
                isUnlocked ? 'bg-green-50 border-green-200' : isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isUnlocked ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-slate-300'
                    }`}>
                      {isUnlocked ? <Unlock className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{milestone.label}</h4>
                      <p className="text-sm text-slate-600">{milestone.goal} jobs completed</p>
                    </div>
                  </div>
                  {isUnlocked && <Badge className="bg-green-500 text-white">Unlocked</Badge>}
                </div>
                <p className="text-sm text-slate-700 ml-13">{milestone.reward}</p>
                {isCurrent && (
                  <div className="mt-3 ml-13">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold">{stats.completedJobs}/{milestone.goal}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Rating Bonus */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Rating Performance Bonus
        </h3>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Current Bonus</p>
              <p className="text-lg font-bold text-amber-600">{getRatingBonus().bonus}</p>
            </div>
            <p className="text-3xl">{getRatingBonus().icon}</p>
          </div>
        </div>

        <div className="space-y-3">
          {RATING_BONUSES.map((bonus, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{bonus.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{bonus.rating}+ Star Rating</p>
                  <p className="text-xs text-slate-500">Monthly bonus</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">{bonus.bonus}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Rewards Summary */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="font-semibold text-slate-900 mb-3">💰 Potential Earnings</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-700">Job completion rewards:</span>
            <span className="font-semibold text-green-600">
              ${unlockedMilestones.reduce((sum, m) => sum + parseInt(m.reward.match(/\d+/)[0]), 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-700">Rating bonus:</span>
            <span className="font-semibold text-green-600">{getRatingBonus().bonus}</span>
          </div>
          <div className="border-t border-green-200 pt-2 mt-2 flex justify-between font-bold text-slate-900">
            <span>Total potential this month:</span>
            <span className="text-lg text-green-600">
              ${unlockedMilestones.reduce((sum, m) => sum + parseInt(m.reward.match(/\d+/)[0]), 0) + 25}+
            </span>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4 bg-indigo-50 border border-indigo-200">
        <p className="text-xs text-indigo-800">
          <strong>Pro Tip:</strong> Complete more jobs and maintain high ratings to unlock bonuses and tier benefits automatically.
        </p>
      </Card>
    </div>
  );
}