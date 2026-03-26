import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Briefcase, Bell } from 'lucide-react';
import FieldJobsList from '@/components/fieldops/FieldJobsList';
import FieldSchedule from '@/components/fieldops/FieldSchedule';
import FieldInvoices from '@/components/fieldops/FieldInvoices';
import FieldProfile from '@/components/fieldops/FieldProfile';
import FieldOpsAccessGate from '@/components/fieldops/FieldOpsAccessGate';
import FieldOpsBreakerView from '@/components/fieldops/FieldOpsBreakerView';
import FieldOpsReporting from '@/pages/FieldOpsReporting';
import JobAlertBanner from '@/components/fieldops/JobAlertBanner';
import JobMapDisplay from '@/components/fieldops/JobMapDisplay';
import FieldOpsSidebar from '@/components/fieldops/FieldOpsSidebar';
import FieldOpsMobileNav from '@/components/fieldops/FieldOpsMobileNav';
import { useJobAlerts } from '@/hooks/useJobAlerts';
import { useOfflineCache } from '@/hooks/useOfflineCache';

export default function FieldOps() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifCount, setNotifCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { newJobs, dismissJob } = useJobAlerts(contractor, isOnline);
  const { isInitialized: cacheReady, saveData, getData } = useOfflineCache();

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
        }
      } catch (e) {
        console.error('FieldOps auth error:', e);
      }
      setLoading(false);
      };
      init();
      }, []);

      // Batch fetch unread messages count with optional batching in init
      useEffect(() => {
      if (!user?.email) return;

      const fetchUnreadCount = async () => {
      try {
        const [messages, projectMessages] = await Promise.all([
          base44.entities.Message.filter({ recipient_email: user.email, read: false }),
          base44.entities.ProjectMessage.filter({ sender_email: { $ne: user.email }, read: false })
        ]);
        setNotifCount((messages?.length || 0) + (projectMessages?.length || 0));
      } catch (error) {
        console.warn('Failed to fetch message counts:', error.message);
      }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
      }, [user?.email]);

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
      <FieldOpsSidebar
        contractor={effectiveContractor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasBreakerAccess={hasBreakerAccess}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Job Alert Banner */}
        {newJobs.length > 0 && (
          <JobAlertBanner 
            jobs={newJobs} 
            onDismiss={dismissJob}
            onViewJob={(job) => {
              setActiveTab('jobs');
              window.scrollTo(0, 0);
            }}
          />
        )}

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

        {/* Job Alert Banner (Mobile) */}
        {newJobs.length > 0 && (
          <JobAlertBanner 
            jobs={newJobs} 
            onDismiss={dismissJob}
            onViewJob={(job) => {
              setActiveTab('jobs');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {/* Mobile Navigation */}
        <FieldOpsMobileNav
          contractor={effectiveContractor}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasBreakerAccess={hasBreakerAccess}
          isOnline={isOnline}
          notifCount={notifCount}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'jobs' && <FieldJobsList contractor={effectiveContractor} user={user} />}
          {activeTab === 'map' && <JobMapDisplay contractor={effectiveContractor} />}
          {activeTab === 'schedule' && <FieldSchedule contractor={effectiveContractor} user={user} />}
          {activeTab === 'invoices' && <FieldInvoices contractor={effectiveContractor} user={user} />}
          {activeTab === 'reports' && <FieldOpsReporting contractor={effectiveContractor} user={user} />}
          {activeTab === 'profile' && <FieldProfile contractor={effectiveContractor} user={user} onUpdate={setContractor} />}
          {activeTab === 'breaker' && <FieldOpsBreakerView contractor={effectiveContractor} user={user} />}
        </div>


      </div>
      </div>
    </div>
  );
}