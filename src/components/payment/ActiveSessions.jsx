import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Timer } from 'lucide-react';

function SessionTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(expiresAt);
      const diff = end - now;

      if (diff <= 0) {
        setExpired(true);
        setRemaining('Expired');
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setRemaining(`${mins}m ${secs}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const end = new Date(expiresAt);
  const now = new Date();
  const totalDuration = 10 * 60 * 1000; // 10 minutes in ms
  const elapsed = Math.min(now - (end - totalDuration), totalDuration);
  const progressPct = Math.min(100, (elapsed / totalDuration) * 100);
  const isWarning = !expired && progressPct > 75;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Timer className={`w-4 h-4 ${expired ? 'text-slate-400' : isWarning ? 'text-red-500' : 'text-amber-500'}`} />
        <span className={`text-sm font-mono font-semibold ${expired ? 'text-slate-400' : isWarning ? 'text-red-600' : 'text-amber-600'}`}>
          {remaining}
        </span>
      </div>
      {!expired && (
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isWarning ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function ActiveSessions({ payments }) {
  const confirmedPayments = (payments || []).filter(
    p => p.status === 'confirmed' && p.session_expires_at
  );

  const now = new Date();
  const active = confirmedPayments.filter(p => new Date(p.session_expires_at) > now);
  const expired = confirmedPayments.filter(p => new Date(p.session_expires_at) <= now);

  if (confirmedPayments.length === 0) return null;

  return (
    <Card className="p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-slate-900">Communication Sessions</h3>
        {active.length > 0 && (
          <Badge className="bg-green-100 text-green-700 ml-auto">{active.length} Active</Badge>
        )}
      </div>

      <div className="space-y-3">
        {active.map(p => (
          <div key={p.id} className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.purpose}</p>
                  <p className="text-xs text-slate-500">
                    Started: {new Date(p.confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' · '}Expires: {new Date(p.session_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
            <SessionTimer expiresAt={p.session_expires_at} />
          </div>
        ))}

        {expired.map(p => (
          <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl opacity-60">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-600">{p.purpose}</p>
                <p className="text-xs text-slate-400">
                  Session expired {new Date(p.session_expires_at).toLocaleDateString()} at{' '}
                  {new Date(p.session_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Badge className="ml-auto bg-slate-100 text-slate-500 text-xs">Expired</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}