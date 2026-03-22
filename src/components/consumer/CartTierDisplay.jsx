import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BADGE_INTERVAL = 15000; // $150 in cents

const getCategoryColor = (category) => {
  switch (category) {
    case 'vendors':
      return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'booths':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'mixed':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    default:
      return 'bg-slate-100 text-slate-900 border-slate-300';
  }
};

const getCategoryLabel = (category) => {
  const labels = {
    vendors: 'Vendors',
    booths: 'Booths',
    mixed: 'Mixed'
  };
  return labels[category] || category;
};

export default function CartTierDisplay({ consumerTier }) {
  const badgesEarned = consumerTier?.badges_earned || [];
  const currentSpent = consumerTier?.total_spent || 0;
  
  const stats = useMemo(() => {
    const nextBadgeThreshold = Math.ceil((currentSpent + 1) / BADGE_INTERVAL) * BADGE_INTERVAL;
    const amountToNextBadge = nextBadgeThreshold - currentSpent;
    const progressPercent = ((currentSpent % BADGE_INTERVAL) / BADGE_INTERVAL) * 100;

    return {
      badgesCount: badgesEarned.length,
      nextBadgeThreshold,
      amountToNextBadge,
      progressPercent,
      totalSpent: (currentSpent / 100).toFixed(2)
    };
  }, [currentSpent, badgesEarned]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-slate-600">Badges Earned</p>
            <p className="text-2xl font-bold text-slate-900">{stats.badgesCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Spent</p>
            <p className="text-2xl font-bold text-slate-900">${stats.totalSpent}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">To Next Badge</p>
            <p className="text-2xl font-bold text-amber-600">${(stats.amountToNextBadge / 100).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress to Next Badge
            </h3>
            <span className="text-sm font-medium text-slate-600">
              ${((currentSpent % BADGE_INTERVAL) / 100).toFixed(2)} / $150.00
            </span>
          </div>
          <Progress value={stats.progressPercent} className="h-2" />
        </div>
      </Card>

      {/* Badges Grid */}
      {badgesEarned.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Your Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badgesEarned.map((badge, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 text-center ${getCategoryColor(badge.category)}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <p className="font-bold text-lg">Badge #{badge.badge_number}</p>
                <Badge variant="outline" className="mt-2">
                  {getCategoryLabel(badge.category)}
                </Badge>
                <p className="text-xs mt-2 opacity-75">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {badgesEarned.length === 0 && currentSpent === 0 && (
        <Card className="p-12 text-center">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No badges yet. Make your first purchase to start earning!</p>
        </Card>
      )}
    </div>
  );
}