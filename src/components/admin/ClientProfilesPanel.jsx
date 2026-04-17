import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, CheckCircle, XCircle, User, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClientProfilesPanel() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | complete | incomplete
  const [expanded, setExpanded] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['adminClientProfiles'],
    queryFn: () => base44.entities.CustomerProfile.list('-created_date', 500),
  });

  const isComplete = (p) => !!(p.full_name && p.phone && p.location && p.property_address && p.date_of_birth);

  const filtered = profiles.filter(p => {
    if (filter === 'complete' && !isComplete(p)) return false;
    if (filter === 'incomplete' && isComplete(p)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const completeCount = profiles.filter(isComplete).length;
  const incompleteCount = profiles.length - completeCount;

  const displayList = expanded ? filtered : filtered.slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg p-3 text-center border transition-colors ${filter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
        >
          <p className="text-xl font-bold">{profiles.length}</p>
          <p className="text-xs mt-0.5">Total Clients</p>
        </button>
        <button
          onClick={() => setFilter('complete')}
          className={`rounded-lg p-3 text-center border transition-colors ${filter === 'complete' ? 'bg-green-700 text-white border-green-700' : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'}`}
        >
          <p className="text-xl font-bold">{completeCount}</p>
          <p className="text-xs mt-0.5">Complete</p>
        </button>
        <button
          onClick={() => setFilter('incomplete')}
          className={`rounded-lg p-3 text-center border transition-colors ${filter === 'incomplete' ? 'bg-orange-600 text-white border-orange-600' : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'}`}
        >
          <p className="text-xl font-bold">{incompleteCount}</p>
          <p className="text-xs mt-0.5">Incomplete</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white text-slate-900"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-slate-400 text-sm py-6 text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-sm py-6 text-center">No profiles found</p>
      ) : (
        <div className="space-y-2">
          {displayList.map(p => {
            const complete = isComplete(p);

            return (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${complete ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <User className={`w-4 h-4 ${complete ? 'text-green-600' : 'text-orange-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.full_name || <span className="italic text-slate-400">No name</span>}</p>
                    {complete
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    }
                  </div>
                  <p className="text-xs text-slate-500 truncate">{p.email}</p>

                </div>
                <div className="text-right flex-shrink-0">
                  {p.location && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                      <MapPin className="w-3 h-3" />{p.location}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(p.created_date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}

          {filtered.length > 8 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg bg-white flex items-center justify-center gap-1 transition-colors"
            >
              {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {filtered.length} profiles</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}