import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Wrench, Filter, Sparkles
} from 'lucide-react';
import FieldJobDetail from './FieldJobDetail';
import RecommendedJobs from './RecommendedJobs';
import FieldJobCard from './FieldJobCard';
import { useLocalCache } from '@/hooks/useMobileOptimization';

const FILTER_TABS = ['All', 'Active', 'Upcoming', 'Completed'];
const VIEW_TABS = ['My Jobs', 'Recommended'];

export default function WaveFOJobsList({ contractor, user }) {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedScope, setSelectedScope] = useState(null);
  const [viewTab, setViewTab] = useState('My Jobs');
  const { data: cachedJobs, set: setCachedJobs } = useLocalCache('wave_fo_jobs', 60);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await base44.entities.ScopeOfWork.filter({ contractor_email: user.email }).catch(() => null);
        if (isMounted) {
          if (data) {
            setScopes(data);
            setCachedJobs(data);
          } else if (cachedJobs) {
            setScopes(cachedJobs);
          }
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          console.warn('Failed to load jobs:', e.message);
          if (cachedJobs) setScopes(cachedJobs);
          setLoading(false);
        }
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user.email]);

  const filtered = useMemo(() => scopes.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['approved', 'active'].includes(s.status);
    if (filter === 'Upcoming') return s.status === 'pending_approval';
    if (filter === 'Completed') return ['closed', 'pending_ratings'].includes(s.status);
    return true;
  }), [scopes, filter]);

  const todayJobs = useMemo(() => scopes.filter(s => {
    if (!s.agreed_work_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return s.agreed_work_date === today;
  }), [scopes]);

  const handleSelectScope = useCallback((scope) => {
    setSelectedScope(scope);
  }, []);

  if (selectedScope) {
    return <FieldJobDetail scope={selectedScope} user={user} onBack={() => setSelectedScope(null)} onUpdate={(updated) => {
      setScopes(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSelectedScope(updated);
    }} />;
  }

  const activeCount = scopes.filter(s => ['approved','active'].includes(s.status)).length;

  return (
    <div className="bg-slate-100 min-h-full">
      {/* View Tabs */}
      <div className="flex gap-2 px-4 mt-4 border-b border-slate-200">
        {VIEW_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setViewTab(tab);
              setFilter('All');
            }}
            className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              viewTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab === 'Recommended' && <Sparkles className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {viewTab === 'Recommended' ? (
        <RecommendedJobs contractor={contractor} user={user} />
      ) : (
        <>
          {/* Today's Summary */}
          {todayJobs.length > 0 && (
            <div className="mx-4 mt-4 bg-blue-100 border border-blue-200 rounded-2xl p-4">
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">Today's Jobs</p>
              <p className="text-slate-800 text-2xl font-bold">{todayJobs.length} Job{todayJobs.length !== 1 ? 's' : ''} Scheduled</p>
              <p className="text-slate-500 text-sm mt-1">
                {todayJobs.map(j => j.job_title).join(', ')}
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
              <p className="text-slate-500 text-xs mt-0.5">Active</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{contractor.completed_jobs_count || 0}</p>
              <p className="text-slate-500 text-xs mt-0.5">Completed</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{contractor.rating ? contractor.rating.toFixed(1) : '—'}</p>
              <p className="text-slate-500 text-xs mt-0.5">Rating</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-4 mt-4 overflow-x-auto scrollbar-none pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
           {FILTER_TABS.map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors min-h-[44px] ${
                 filter === f
                   ? 'bg-blue-600 text-white'
                   : 'bg-white border border-slate-200 text-slate-500'
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
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No jobs found</p>
            <p className="text-slate-400 text-sm mt-1">New jobs will appear here</p>
          </div>
          ) : (
          filtered.map(scope => (
            <FieldJobCard 
              key={scope.id}
              scope={scope}
              onSelect={() => handleSelectScope(scope)}
            />
          ))
          )}
          </div>
        </>
      )}
    </div>
  );
}