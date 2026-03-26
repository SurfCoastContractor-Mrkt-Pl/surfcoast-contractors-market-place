import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  Briefcase, Clock, DollarSign, CheckCircle, MapPin,
  Camera, FileText, MessageSquare, Calendar, ChevronRight,
  Wifi, WifiOff, Bell, User, Home, Plus, Menu, X
} from 'lucide-react';
import FieldJobsList from '@/components/fieldops/FieldJobsList';
import FieldSchedule from '@/components/fieldops/FieldSchedule';
import FieldInvoices from '@/components/fieldops/FieldInvoices';
import FieldProfile from '@/components/fieldops/FieldProfile';
import FieldOpsAccessGate from '@/components/fieldops/FieldOpsAccessGate';
import { getHighestBadge } from '@/components/badges/ContractorBadges';

const NAV_TABS = [
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'invoices', label: 'Invoices', icon: DollarSign },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function FieldOps() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          const contractors = await base44.entities.Contractor.filter({ email: me.email });
          if (contractors?.length > 0) setContractor(contractors[0]);

          // Unread messages
          try {
            const unread = await base44.entities.Message.filter({ recipient_email: me.email, read: false });
            setNotifCount(unread?.length || 0);
          } catch {}
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading Field Ops...</p>
        </div>
      </div>
    );
  }

  // Check badge-based access — Field Ops requires at least Badge Tier 3 (5 unique customers)
  const highestBadge = getHighestBadge(contractor?.unique_customers_count || 0);
  const hasFieldOpsAccess = (highestBadge?.tier || 0) >= 3;

  if (contractor && !hasFieldOpsAccess) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-slate-950">
        <FieldOpsAccessGate contractor={contractor} />
      </div>
    );
  }

  if (!user || !contractor) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center text-white max-w-sm">
          <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Field Ops</h1>
          <p className="text-slate-400 mb-6">Sign in with a contractor account to access the Field Ops system.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
          >
            Sign In
          </button>
          <Link to="/" className="block mt-4 text-slate-400 text-sm hover:text-white">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Status Bar */}
      <div className="bg-slate-900 px-4 pt-safe-top pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-slate-400">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-white">FIELD OPS</span>
          <span className="text-xs text-blue-400 font-semibold ml-1">PRO</span>
        </div>
        <button className="relative p-1">
          <Bell className="w-5 h-5 text-slate-400" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
      </div>

      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 flex-shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {contractor.photo_url
              ? <img src={contractor.photo_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-sm">{contractor.name?.charAt(0)}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{contractor.name}</p>
            <p className="text-slate-400 text-xs truncate capitalize">
              {contractor.line_of_work?.replace(/_/g, ' ') || contractor.trade_specialty || 'Contractor'}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
            contractor.availability_status === 'available' ? 'bg-green-900 text-green-400' :
            contractor.availability_status === 'booked' ? 'bg-yellow-900 text-yellow-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {contractor.availability_status || 'Available'}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {activeTab === 'jobs' && <FieldJobsList contractor={contractor} user={user} />}
        {activeTab === 'schedule' && <FieldSchedule contractor={contractor} user={user} />}
        {activeTab === 'invoices' && <FieldInvoices contractor={contractor} user={user} />}
        {activeTab === 'profile' && <FieldProfile contractor={contractor} user={user} onUpdate={setContractor} />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-slate-900 border-t border-slate-800 flex-shrink-0 pb-safe-bottom">
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
  );
}