import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Briefcase, Bell, MapPin, ArrowLeft } from 'lucide-react';
import SupplyHousesFinder from '@/components/contractor/SupplyHousesFinder';
import WaveFOJobsList from '@/components/fieldops/FieldJobsList';
import WaveFOSchedule from '@/components/fieldops/FieldSchedule';
import WaveFOInvoices from '@/components/fieldops/FieldInvoices';
import WaveFOProfile from '@/components/fieldops/FieldProfile';
import FieldOpsAccessGate from '@/components/fieldops/FieldOpsAccessGate';
import SurfCoastWaveFOView from '@/components/fieldops/FieldOpsBreakerView';
import WaveFOReporting from '@/pages/FieldOpsReporting';
import JobAlertBanner from '@/components/fieldops/JobAlertBanner';
import WaveFOJobMapDisplay from '@/components/fieldops/JobMapDisplay';
import WaveFOSidebar from '@/components/fieldops/FieldOpsSidebar';
import WaveFOMobileNav from '@/components/fieldops/FieldOpsMobileNav';
import WaveFOAssistant from '@/components/fieldops/WaveFOAssistant';
import { useJobAlerts } from '@/hooks/useJobAlerts';
import { useOfflineCache } from '@/hooks/useOfflineCache';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'Wave FO Jobs' },
  { id: 'map', label: 'Wave FO Map' },
  { id: 'schedule', label: 'Wave FO Schedule' },
  { id: 'invoices', label: 'Wave FO Invoices' },
  { id: 'reports', label: 'Wave FO Reports' },
  { id: 'profile', label: 'Wave FO Profile' },
  { id: 'supplies', label: 'Supply Houses' },
];
const BREAKER_TAB = { id: 'breaker', label: 'SurfCoast Wave FO' };

export default function WaveFo() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifCount, setNotifCount] = useState(0);
  const [showSupplyHouses, setShowSupplyHouses] = useState(false);
  const { newJobs, dismissJob } = useJobAlerts(contractor, isOnline);

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
        console.error('Wave FO auth error:', e);
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
          base44.entities.Message.filter({ recipient_email: user.email, read: false }).catch(() => []),
          base44.entities.ProjectMessage.filter({ sender_email: { $ne: user.email }, read: false }).catch(() => [])
        ]);
        const messageCount = Array.isArray(messages) ? messages.length : 0;
        const projectMessageCount = Array.isArray(projectMessages) ? projectMessages.length : 0;
        setNotifCount(messageCount + projectMessageCount);
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
          <p className="text-slate-400 text-sm">Loading Wave FO...</p>
        </div>
      </div>
    );
  }

  // Check Wave FO access — requires SurfCoast Wave FO (55 completed jobs)
  // Admins bypass all tier/contractor requirements for testing
  const completedJobsCount = contractor?.completed_jobs_count || 0;
  const BREAKER_JOBS_REQUIRED = 55;
  // Show AI assistant only for Ripple (15-34 jobs) and Swell (35-54 jobs) tiers
  const showWaveFOAssistant = !isAdmin && completedJobsCount < BREAKER_JOBS_REQUIRED;
  const hasWaveFOAccess = isAdmin || completedJobsCount >= BREAKER_JOBS_REQUIRED;
  const hasSurfCoastWaveFOAccess = isAdmin || completedJobsCount >= BREAKER_JOBS_REQUIRED;
  const NAV_TABS = hasSurfCoastWaveFOAccess
    ? [...BASE_NAV_TABS, BREAKER_TAB]
    : BASE_NAV_TABS;

  if (contractor && !hasWaveFOAccess) {
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
          <h1 className="text-2xl font-bold mb-2">Wave FO</h1>
          <p className="text-slate-400 mb-6">Sign in with a contractor account to access Wave FO.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(`${window.location.origin}/WaveFo`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
          >
            Sign In to Wave FO
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
      <WaveFOSidebar
        contractor={effectiveContractor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasBreakerAccess={hasSurfCoastWaveFOAccess}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between bg-slate-900 px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <h1 className="text-white font-semibold text-lg">
            {NAV_TABS.find(t => t.id === activeTab)?.label || 'Wave FO'}
          </h1>
          <Link to="/ContractorAccount" className="relative p-2 mr-1 group flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xl:inline">Portal</span>
          </Link>
          <button className="relative p-2">
            <Bell className="w-5 h-5 text-slate-400" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
        </div>

        {/* Job Alert Banner */}
        {newJobs.length > 0 && (
          <JobAlertBanner 
            jobs={newJobs} 
            onDismiss={dismissJob}
            onViewJob={() => {
              setActiveTab('jobs');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {/* Mobile Navigation */}
        <WaveFOMobileNav
          contractor={effectiveContractor}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasBreakerAccess={hasSurfCoastWaveFOAccess}
          isOnline={isOnline}
          notifCount={notifCount}
        />

        {/* Mobile Back Button */}
        <div className="lg:hidden flex items-center bg-slate-900 border-b border-slate-800 px-4 py-2">
          <Link to="/ContractorAccount" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'jobs' && <WaveFOJobsList contractor={effectiveContractor} user={user} />}
          {activeTab === 'map' && <WaveFOJobMapDisplay contractor={effectiveContractor} />}
          {activeTab === 'schedule' && <WaveFOSchedule contractor={effectiveContractor} user={user} />}
          {activeTab === 'invoices' && <WaveFOInvoices contractor={effectiveContractor} user={user} />}
          {activeTab === 'reports' && <WaveFOReporting contractor={effectiveContractor} user={user} />}
          {activeTab === 'profile' && <WaveFOProfile contractor={effectiveContractor} user={user} onUpdate={setContractor} />}
          {activeTab === 'supplies' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Find Supply Houses
              </h2>
              <button
                onClick={() => setShowSupplyHouses(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                Find Nearby Supply Houses
              </button>
            </div>
          )}
          {activeTab === 'breaker' && <SurfCoastWaveFOView contractor={effectiveContractor} user={user} />}
        </div>
      </div>
      </div>

      {/* Wave FO AI Assistant — Ripple & Swell tiers only */}
      {showWaveFOAssistant && (
        <WaveFOAssistant
          contractor={effectiveContractor}
          activeTab={activeTab}
        />
      )}

      {/* Supply Houses Modal */}
      <SupplyHousesFinder
        contractor={effectiveContractor}
        isOpen={showSupplyHouses}
        onClose={() => setShowSupplyHouses(false)}
      />
    </div>
  );
}