import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  Briefcase, Clock, DollarSign, CheckCircle, MapPin,
  Camera, FileText, MessageSquare, Calendar, ChevronRight,
  Wifi, WifiOff, Bell, User, Home, Plus, Menu, X, Waves, BarChart3
} from 'lucide-react';
import FieldJobsList from '@/components/fieldops/FieldJobsList';
import FieldSchedule from '@/components/fieldops/FieldSchedule';
import FieldInvoices from '@/components/fieldops/FieldInvoices';
import FieldProfile from '@/components/fieldops/FieldProfile';
import FieldOpsAccessGate from '@/components/fieldops/FieldOpsAccessGate';
import FieldOpsBreakerView from '@/components/fieldops/FieldOpsBreakerView';
import FieldOpsReporting from '@/pages/FieldOpsReporting';
import { getHighestBadge } from '@/components/badges/ContractorBadges';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'invoices', label: 'Invoices', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

const BREAKER_TAB = { id: 'breaker', label: 'Field Ops', icon: Waves };

export default function FieldOps() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifCount, setNotifCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          setLoading(false);
          return;
        }
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          if (me.role === 'admin') setIsAdmin(true);
          const contractors = await base44.entities.Contractor.filter({ email: me.email });
          if (contractors?.length > 0) setContractor(contractors[0]);

          // Unread messages
          try {
            const unread = await base44.entities.Message.filter({ recipient_email: me.email, read: false });
            setNotifCount(unread?.length || 0);
          } catch {}
        }
      } catch (e) {
        console.error('FieldOps auth error:', e);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading SurfCoast Waves FO...</p>
        </div>
      </div>
    );
  }

  // Check Field Ops access — requires Breaker wave (55 completed jobs)
  // Admins bypass all tier/contractor requirements for testing
  const completedJobsCount = contractor?.completed_jobs_count || 0;
  const BREAKER_JOBS_REQUIRED = 55;
  const hasFieldOpsAccess = isAdmin || completedJobsCount >= BREAKER_JOBS_REQUIRED;
  const hasBreakerAccess = isAdmin || completedJobsCount >= BREAKER_JOBS_REQUIRED;
  const NAV_TABS = hasBreakerAccess
    ? [...BASE_NAV_TABS, BREAKER_TAB]
    : BASE_NAV_TABS;

  if (contractor && !hasFieldOpsAccess) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-slate-950">
        <FieldOpsAccessGate contractor={contractor} />
      </div>
    );
  }

  if (!user || (!contractor && !isAdmin)) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center text-white max-w-sm">
          <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">SurfCoast Waves FO</h1>
          <p className="text-slate-400 mb-6">Sign in with a contractor account to access the SurfCoast Waves Field Operations system.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(`${window.location.origin}/FieldOps`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
          >
            Sign In to SurfCoast Waves FO
          </button>
          <Link to="/" className="block mt-4 text-slate-400 text-sm hover:text-white">← Back to Home</Link>
        </div>
      </div>
    );
  }

  // Admin test mode — create a mock contractor shell if no contractor profile exists
  const effectiveContractor = contractor || {
    name: user?.full_name || 'Admin Test',
    email: user?.email,
    availability_status: 'available',
    unique_customers_count: 999,
    photo_url: null,
    line_of_work: 'admin_test_mode',
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Admin Test Mode Banner */}
      {isAdmin && (
        <div className={`${!contractor ? 'bg-amber-600' : 'bg-amber-700'} text-white text-xs font-bold text-center py-1.5 px-4`}>
          {!contractor ? '⚠️ ADMIN TEST MODE — No contractor profile linked to your account' : '🔧 ADMIN TEST MODE — Tier restrictions bypassed'}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-slate-800">
          <h2 className="text-white font-bold text-sm">SURFCOAST WAVES FO</h2>
          <p className="text-blue-400 text-xs font-semibold mt-0.5">PRO</p>
        </div>

        {/* Contractor Info */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {effectiveContractor.photo_url
                ? <img src={effectiveContractor.photo_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-sm">{effectiveContractor.name?.charAt(0)}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{effectiveContractor.name}</p>
              <p className="text-slate-400 text-xs truncate capitalize">
                {effectiveContractor.line_of_work?.replace(/_/g, ' ') || effectiveContractor.trade_specialty || 'Contractor'}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold w-full text-center ${
            effectiveContractor.availability_status === 'available' ? 'bg-green-900 text-green-400' :
            effectiveContractor.availability_status === 'booked' ? 'bg-yellow-900 text-yellow-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {effectiveContractor.availability_status || 'Available'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isBreaker = tab.id === 'breaker';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isBreaker ? 'bg-blue-900 text-blue-300' : 'bg-blue-900 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between bg-slate-900 px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <h1 className="text-white font-semibold text-lg">
            {NAV_TABS.find(t => t.id === activeTab)?.label || 'Field Ops'}
          </h1>
          <button className="relative p-2">
            <Bell className="w-5 h-5 text-slate-400" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-400">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white">SURFCOAST WAVES FO</span>
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

        {/* Mobile Contractor Info */}
        <div className="lg:hidden bg-slate-900 px-4 py-3 flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {effectiveContractor.photo_url
                ? <img src={effectiveContractor.photo_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-sm">{effectiveContractor.name?.charAt(0)}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{effectiveContractor.name}</p>
              <p className="text-slate-400 text-xs truncate capitalize">
                {effectiveContractor.line_of_work?.replace(/_/g, ' ') || effectiveContractor.trade_specialty || 'Contractor'}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
              effectiveContractor.availability_status === 'available' ? 'bg-green-900 text-green-400' :
              effectiveContractor.availability_status === 'booked' ? 'bg-yellow-900 text-yellow-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {effectiveContractor.availability_status || 'Available'}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'jobs' && <FieldJobsList contractor={effectiveContractor} user={user} />}
          {activeTab === 'schedule' && <FieldSchedule contractor={effectiveContractor} user={user} />}
          {activeTab === 'invoices' && <FieldInvoices contractor={effectiveContractor} user={user} />}
          {activeTab === 'reports' && <FieldOpsReporting contractor={effectiveContractor} user={user} />}
          {activeTab === 'profile' && <FieldProfile contractor={effectiveContractor} user={user} onUpdate={setContractor} />}
          {activeTab === 'breaker' && <FieldOpsBreakerView contractor={effectiveContractor} user={user} />}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 flex-shrink-0 pb-safe-bottom">
          <div className="flex">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isBreaker = tab.id === 'breaker';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                    isActive
                      ? isBreaker ? 'text-blue-300' : 'text-blue-400'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {isActive && (
                    <div className={`w-1 h-1 rounded-full ${isBreaker ? 'bg-blue-300' : 'bg-blue-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}