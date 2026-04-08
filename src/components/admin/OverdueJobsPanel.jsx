import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User, Briefcase, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

export default function OverdueJobsPanel() {
  const [overdueScopes, setOverdueScopes] = useState([]);
  const [lockedContractors, setLockedContractors] = useState([]);
  const [lockedClients, setLockedClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch all approved scopes with an expected_completion_date in the past
      const allApproved = await base44.entities.ScopeOfWork.filter({ status: 'approved' });
      const now = new Date();
      const overdue = allApproved.filter(s =>
        s.expected_completion_date && isPast(parseISO(s.expected_completion_date))
      );
      setOverdueScopes(overdue);

      // Fetch locked contractors and clients
      const [contractors, clients] = await Promise.all([
        base44.entities.Contractor.filter({ account_locked_for_overdue_job: true }),
        base44.entities.CustomerProfile.filter({ account_locked_for_overdue_job: true }),
      ]);
      setLockedContractors(contractors || []);
      setLockedClients(clients || []);
    } catch (err) {
      console.error('OverdueJobsPanel load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runEnforcement = async () => {
    await base44.functions.invoke('checkOverdueJobs', {});
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Overdue Active Jobs', value: overdueScopes.length, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
          { label: 'Locked Contractors', value: lockedContractors.length, color: 'bg-orange-100 text-orange-700', icon: User },
          { label: 'Locked Clients', value: lockedClients.length, color: 'bg-yellow-100 text-yellow-700', icon: User },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl p-4 ${color} flex items-center gap-3`}>
            <Icon className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={runEnforcement} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Run Enforcement Now
        </Button>
      </div>

      {/* Overdue Scopes Table */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-red-500" />
          Overdue Jobs ({overdueScopes.length})
        </h3>
        {overdueScopes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-xl">No overdue jobs — all clear.</div>
        ) : (
          <div className="space-y-3">
            {overdueScopes.map(scope => {
              const overdueSince = formatDistanceToNow(parseISO(scope.expected_completion_date), { addSuffix: true });
              return (
                <div key={scope.id} className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{scope.job_title}</p>
                      <p className="text-xs text-slate-600">Contractor: <strong>{scope.contractor_name}</strong> · Client: <strong>{scope.client_name}</strong></p>
                    </div>
                    <Badge className="bg-red-600 text-white text-xs shrink-0">OVERDUE</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <Clock className="w-3 h-3" />
                    <span>Expected completion was {overdueSince}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Expected: {new Date(scope.expected_completion_date).toLocaleString()} · 
                    Cost: {scope.cost_type === 'hourly' ? `$${scope.cost_amount}/hr` : `$${scope.cost_amount}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Locked Contractors */}
      {lockedContractors.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            Locked Contractors ({lockedContractors.length})
          </h3>
          <div className="space-y-2">
            {lockedContractors.map(c => (
              <div key={c.id} className="flex items-center justify-between border border-orange-200 bg-orange-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange-600 text-white text-xs">Account Locked</Badge>
                  {c.billing_deletion_pending && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">⚠ Deletion Pending</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Clients */}
      {lockedClients.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-yellow-600" />
            Locked Clients ({lockedClients.length})
          </h3>
          <div className="space-y-2">
            {lockedClients.map(c => (
              <div key={c.id} className="flex items-center justify-between border border-yellow-200 bg-yellow-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <Badge className="bg-yellow-600 text-white text-xs">Account Locked</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}