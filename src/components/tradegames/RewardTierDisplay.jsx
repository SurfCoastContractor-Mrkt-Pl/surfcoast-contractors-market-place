import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Lock } from 'lucide-react';

const TIER_CONFIG = {
  bronze: { color: 'bg-amber-100', textColor: 'text-amber-900', icon: '🥉' },
  silver: { color: 'bg-slate-100', textColor: 'text-slate-900', icon: '🥈' },
  gold: { color: 'bg-yellow-100', textColor: 'text-yellow-900', icon: '🥇' },
  platinum: { color: 'bg-blue-100', textColor: 'text-blue-900', icon: '💎' }
};

export default function RewardTierDisplay({ userEmail }) {
  const { data: rewardTier, isLoading } = useQuery({
    queryKey: ['rewardTier', userEmail],
    queryFn: async () => {
      const results = await base44.entities.GameRewardTier.filter({
        contractor_email: userEmail
      });
      return results[0] || null;
    },
    enabled: !!userEmail
  });

  if (isLoading) return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
  if (!rewardTier) return null;

  const config = TIER_CONFIG[rewardTier.current_tier];
  const tierIndex = ['bronze', 'silver', 'gold', 'platinum'].indexOf(rewardTier.current_tier);
  const progressPercent = rewardTier.next_tier_points_needed 
    ? Math.min(100, (rewardTier.tier_points / rewardTier.next_tier_points_needed) * 100)
    : 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Reward Tier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tier */}
        <div className={`p-4 rounded-lg ${config.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Tier</p>
              <p className={`text-2xl font-bold ${config.textColor}`}>
                {config.icon} {rewardTier.current_tier.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className={`text-2xl font-bold ${config.textColor}`}>
                {rewardTier.tier_points}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {rewardTier.next_tier_points_needed && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress to Next Tier</span>
              <span className="text-sm text-gray-600">
                {rewardTier.tier_points} / {rewardTier.next_tier_points_needed}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Games Completed</p>
            <p className="text-xl font-bold">{rewardTier.total_games_completed}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Highest Score</p>
            <p className="text-xl font-bold">{rewardTier.lifetime_high_score}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Total Discounts</p>
            <p className="text-xl font-bold">${rewardTier.total_discounts_earned.toFixed(0)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Achievements</p>
            <p className="text-xl font-bold">{rewardTier.achievement_badges?.length || 0}</p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div>
          <p className="text-sm font-medium mb-2">Tier Benefits</p>
          <div className="space-y-2">
            {rewardTier.tier_benefits_unlocked?.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        {rewardTier.achievement_badges?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Achievements</p>
            <div className="flex flex-wrap gap-2">
              {rewardTier.achievement_badges.map((badge, idx) => (
                <Badge key={idx} className="gap-1">
                  <Award className="w-3 h-3" />
                  {badge.badge_name.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}