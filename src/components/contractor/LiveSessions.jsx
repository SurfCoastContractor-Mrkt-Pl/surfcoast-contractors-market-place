import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MAX_SECONDS = 600;

function formatRemaining(secondsUsed) {
  const remaining = Math.max(0, MAX_SECONDS - (secondsUsed || 0));
  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LiveSessions({ contractorEmail }) {
  const navigate = useNavigate();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['contractor-live-sessions', contractorEmail],
    queryFn: () => base44.entities.TimedChatSession.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorEmail,
    refetchInterval: 15000,
  });

  const activeSessions = sessions?.filter(s => s.status === 'active') || [];
  const recentExpired = sessions?.filter(s => s.status === 'expired')
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    .slice(0, 3) || [];

  if (isLoading) return (
    <Card><CardContent className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
    </CardContent></Card>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Live Chat Sessions
          {activeSessions.length > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">{activeSessions.length} active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeSessions.length === 0 && recentExpired.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No timed chat sessions yet.</p>
        ) : null}

        {activeSessions.map(s => {
          const secondsUsed = s.total_seconds_used || 0;
          const remaining = MAX_SECONDS - secondsUsed;
          const isAlmostDone = remaining < 120;
          return (
            <div key={s.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{s.customer_name || s.customer_email}</p>
                <p className="text-xs text-slate-500">{new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 font-mono text-sm font-bold ${isAlmostDone ? 'text-red-600' : 'text-green-700'}`}>
                  <Clock className="w-4 h-4" />
                  {formatRemaining(secondsUsed)}
                </div>
                <Button
                  size="sm"
                  className="text-xs h-7"
                  style={{ backgroundColor: '#1E5A96' }}
                  onClick={() => navigate(`/timed-chat/${s.id}`)}
                >
                  Join
                </Button>
              </div>
            </div>
          );
        })}

        {recentExpired.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent Completed</p>
            {recentExpired.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm text-slate-700">{s.customer_name || s.customer_email}</p>
                  <p className="text-xs text-slate-400">{new Date(s.started_at).toLocaleDateString()}</p>
                </div>
                <Badge className="bg-slate-200 text-slate-600 text-xs">Ended</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}