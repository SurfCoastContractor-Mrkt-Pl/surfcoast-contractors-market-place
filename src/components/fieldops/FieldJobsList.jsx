import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  MapPin, Clock, DollarSign, ChevronRight, Plus,
  CheckCircle, AlertCircle, Camera, FileText, Phone,
  MessageSquare, Navigation, Wrench, Filter
} from 'lucide-react';
import FieldJobDetail from './FieldJobDetail';

const STATUS_CONFIG = {
  pending_approval: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-900/40', dot: 'bg-yellow-400' },
  approved: { label: 'Approved', color: 'text-blue-400', bg: 'bg-blue-900/40', dot: 'bg-blue-400' },
  active: { label: 'In Progress', color: 'text-green-400', bg: 'bg-green-900/40', dot: 'bg-green-400' },
  pending_ratings: { label: 'Pending Rating', color: 'text-purple-400', bg: 'bg-purple-900/40', dot: 'bg-purple-400' },
  closed: { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-700/40', dot: 'bg-slate-400' },
};

const FILTER_TABS = ['All', 'Active', 'Upcoming', 'Completed'];

export default function FieldJobsList({ contractor, user }) {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedScope, setSelectedScope] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.ScopeOfWork.filter({ contractor_email: user.email });
        setScopes(data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user.email]);

  const filtered = scopes.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['approved', 'active'].includes(s.status);
    if (filter === 'Upcoming') return s.status === 'pending_approval';
    if (filter === 'Completed') return ['closed', 'pending_ratings'].includes(s.status);
    return true;
  });

  const todayJobs = scopes.filter(s => {
    if (!s.agreed_work_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return s.agreed_work_date === today;
  });

  if (selectedScope) {
    return <FieldJobDetail scope={selectedScope} user={user} onBack={() => setSelectedScope(null)} onUpdate={(updated) => {
      setScopes(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSelectedScope(updated);
    }} />;
  }

  return (
    <div className="bg-slate-950 min-h-full">
      {/* Today's Summary */}
      {todayJobs.length > 0 && (
        <div className="mx-4 mt-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">Today's Jobs</p>
          <p className="text-white text-2xl font-bold">{todayJobs.length} Job{todayJobs.length !== 1 ? 's' : ''} Scheduled</p>
          <p className="text-slate-400 text-sm mt-1">
            {todayJobs.map(j => j.job_title).join(', ')}
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
        <div className="bg-slate-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{scopes.filter(s => ['approved','active'].includes(s.status)).length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Active</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{contractor.completed_jobs_count || 0}</p>
          <p className="text-slate-500 text-xs mt-0.5">Completed</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{contractor.rating ? contractor.rating.toFixed(1) : '—'}</p>
          <p className="text-slate-500 text-xs mt-0.5">Rating</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto scrollbar-none pb-1">
        {FILTER_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="px-4 mt-4 pb-6 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading jobs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No jobs found</p>
            <p className="text-slate-600 text-sm mt-1">New jobs will appear here</p>
          </div>
        ) : (
          filtered.map(scope => {
            const status = STATUS_CONFIG[scope.status] || STATUS_CONFIG.pending_approval;
            return (
              <button
                key={scope.id}
                onClick={() => setSelectedScope(scope)}
                className="w-full bg-slate-900 rounded-2xl p-4 text-left border border-slate-800 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-white font-semibold text-base leading-tight truncate">{scope.job_title}</p>
                    <p className="text-slate-400 text-sm mt-1 truncate">{scope.customer_name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
                  {scope.agreed_work_date && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(scope.agreed_work_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <DollarSign className="w-3.5 h-3.5" />
                    {scope.cost_type === 'hourly' ? `$${scope.cost_amount}/hr` : `$${scope.cost_amount?.toLocaleString()}`}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}