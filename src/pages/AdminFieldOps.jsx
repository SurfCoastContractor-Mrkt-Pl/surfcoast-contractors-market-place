import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Shield, Search, ChevronRight, Briefcase, Calendar, DollarSign, User, Users } from 'lucide-react';
import FieldJobsList from '@/components/fieldops/FieldJobsList';
import FieldSchedule from '@/components/fieldops/FieldSchedule';
import FieldInvoices from '@/components/fieldops/FieldInvoices';
import FieldProfile from '@/components/fieldops/FieldProfile';
import ClientDatabasePanel from '@/components/admin/ClientDatabasePanel';

const NAV_TABS = [
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'invoices', label: 'Invoices', icon: DollarSign },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'clients', label: 'Clients', icon: Users },
];

export default function AdminFieldOps() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.role === 'admin') {
          setIsAdmin(true);
          const all = await base44.entities.Contractor.list('-created_date', 200);
          setContractors(all || []);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center text-white">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Admin Access Only</h1>
          <p className="text-slate-400 text-sm mb-6">You must be an admin to view this page.</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const filtered = contractors.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Contractor picker view
  if (!selectedContractor) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold text-sm">Admin Wave FO</span>
              <span className="bg-amber-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
            </div>
            <Link to="/admin" className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
              ← Admin
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <p className="text-slate-500 text-xs mt-2">{filtered.length} of {contractors.length} contractors</p>
        </div>

        {/* Contractor List */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-16 text-sm">No contractors found</div>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedContractor(c)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.photo_url
                    ? <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-white font-bold text-sm">{c.name?.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{c.name}</p>
                    {c.account_locked && <span className="text-[10px] bg-red-900 text-red-400 px-1.5 py-0.5 rounded font-bold">LOCKED</span>}
                  </div>
                  <p className="text-slate-500 text-xs truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{c.completed_jobs_count || 0} jobs</p>
                    <p className="text-[10px] text-slate-600 capitalize">{c.trade_specialty?.replace('_', ' ') || c.line_of_work?.split('_').slice(0,2).join(' ') || '—'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Full Field Ops view for selected contractor (admin-impersonated)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col flex-1">
        {/* Admin Banner */}
        <div className="bg-amber-600 px-4 py-1.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-100" />
            <span className="text-amber-100 text-xs font-semibold">Admin View: {selectedContractor.name}</span>
          </div>
          <button
            onClick={() => setSelectedContractor(null)}
            className="text-amber-100 text-xs hover:text-white underline"
          >
            Change Contractor
          </button>
        </div>

        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex-shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {selectedContractor.photo_url
              ? <img src={selectedContractor.photo_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-sm">{selectedContractor.name?.charAt(0)}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{selectedContractor.name}</p>
            <p className="text-slate-400 text-xs truncate capitalize">
              {selectedContractor.line_of_work?.replace(/_/g, ' ') || selectedContractor.trade_specialty || 'Contractor'}
            </p>
          </div>
          <div className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-900 text-amber-400">
            Admin Preview
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'jobs' && <FieldJobsList contractor={selectedContractor} user={user} />}
        {activeTab === 'schedule' && <FieldSchedule contractor={selectedContractor} user={user} />}
        {activeTab === 'invoices' && <FieldInvoices contractor={selectedContractor} user={user} />}
        {activeTab === 'profile' && <FieldProfile contractor={selectedContractor} user={user} onUpdate={() => {}} />}
        {activeTab === 'clients' && <div className="p-6"><ClientDatabasePanel /></div>}
      </div>

        {/* Bottom Navigation */}
        <div className="bg-slate-900 border-t border-slate-800 flex-shrink-0">
          <div className="flex">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}