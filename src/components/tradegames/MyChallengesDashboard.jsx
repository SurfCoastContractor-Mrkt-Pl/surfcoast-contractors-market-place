import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Zap, Trophy, Clock, Target, Users } from 'lucide-react';
import { format } from 'date-fns';

function ChallengeRow({ challenge }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const link = `${window.location.origin}/challenge/${challenge.challenge_token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    expired: 'bg-slate-100 text-slate-600',
  }[challenge.status] || 'bg-slate-100 text-slate-600';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-slate-900 text-sm truncate">{challenge.game_title}</span>
          <Badge className={`text-xs shrink-0 ${statusColor}`}>
            {challenge.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {challenge.discount_percentage}% discount
          </span>
          {challenge.scope_of_work_id && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-500" />
              Scope linked
            </span>
          )}
          {challenge.completed_by_email && (
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-500" />
              Completed by {challenge.completed_by_email}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expires {format(new Date(challenge.expires_at), 'MMM d, yyyy')}
          </span>
        </div>
        {challenge.final_score && (
          <div className="mt-1 text-xs text-slate-500">
            Final score: <span className="font-semibold text-slate-700">{challenge.final_score}</span>
          </div>
        )}
      </div>
      {challenge.status === 'active' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="shrink-0 gap-1.5 text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      )}
    </div>
  );
}

export default function MyChallengesDashboard({ contractorEmail }) {
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['my-game-challenges', contractorEmail],
    queryFn: () => base44.entities.GameChallenge.filter(
      { contractor_email: contractorEmail },
      '-created_date',
      50
    ),
    enabled: !!contractorEmail,
    staleTime: 2 * 60 * 1000,
  });

  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active').length,
    completed: challenges.filter(c => c.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Sent', value: stats.total, Icon: Users, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, Icon: Zap, color: 'text-green-600' },
          { label: 'Completed', value: stats.completed, Icon: Trophy, color: 'text-yellow-600' },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} /> {/* Icon is the destructured component */}
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenge List */}
      {challenges.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Zap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No challenges created yet</p>
          <p className="text-sm">Create a challenge link from any trade game to give clients a discount.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {challenges.map(c => <ChallengeRow key={c.id} challenge={c} />)}
        </div>
      )}
    </div>
  );
}