import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Briefcase, Bell, ArrowLeft } from 'lucide-react';
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
import FieldOpsHamburgerMenu from '@/components/fieldops/FieldOpsHamburgerMenu';
import { useJobAlerts } from '@/hooks/useJobAlerts';
import { useOfflineCache } from '@/hooks/useOfflineCache';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'WAVE OS Jobs' },
  { id: 'map', label: 'WAVE OS Map' },
  { id: 'schedule', label: 'WAVE OS Schedule' },
  { id: 'invoices', label: 'WAVE OS Invoices' },
  { id: 'reports', label: 'WAVE OS Reports' },
  { id: 'profile', label: 'WAVE OS Profile' },
  { id: 'supplies', label: 'Supply Houses' },
];
const BREAKER_TAB = { id: 'breaker', label: 'SurfCoast WAVE OS' };

export default function WaveOS() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifCount, setNotifCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        console.error('WAVE OS auth error:', e);
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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center", color: T.dark }}>
          <div style={{ width: 48, height: 48, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: T.muted, fontSize: 14, fontStyle: "italic" }}>Loading WAVE OS...</p>
        </div>
      </div>
    );
  }

  // Check WAVE OS access — requires SurfCoast WAVE OS (55 completed jobs)
  // Admins bypass all tier/contractor requirements for testing
  const completedJobsCount = contractor?.completed_jobs_count || 0;
  const BREAKER_JOBS_REQUIRED = 55;
  // Show AI assistant only for Ripple (15-34 jobs) and Swell (35-54 jobs) tiers
  const showWaveOSAssistant = !isAdmin && completedJobsCount >= 15 && completedJobsCount < BREAKER_JOBS_REQUIRED;
  const hasWaveOSAccess = isAdmin || completedJobsCount >= BREAKER_JOBS_REQUIRED;
  const hasSurfCoastWaveOSAccess = isAdmin || completedJobsCount >= BREAKER_JOBS_REQUIRED;
  const NAV_TABS = hasSurfCoastWaveOSAccess
    ? [...BASE_NAV_TABS, BREAKER_TAB]
    : BASE_NAV_TABS;

  if (contractor && !hasWaveOSAccess) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <FieldOpsAccessGate contractor={contractor} />
      </div>
    );
  }

  if (!user || (!contractor && !isAdmin)) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 24, paddingRight: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center", color: T.dark, maxWidth: 448 }}>
          <Briefcase style={{ width: 64, height: 64, color: T.amber, margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, fontStyle: "italic" }}>WAVE OS</h1>
           <p style={{ color: T.muted, marginBottom: 24, fontStyle: "italic" }}>Sign in with a contractor account to access WAVE OS.</p>
           <button
             onClick={() => base44.auth.redirectToLogin(`${window.location.origin}/WaveOS`)}
             style={{ width: "100%", background: T.dark, color: "#fff", fontWeight: 600, paddingTop: 16, paddingBottom: 16, borderRadius: 12, fontSize: 16, border: "none", cursor: "pointer" }}
           >
             Sign In to WAVE OS
          </button>
          <Link to="/" style={{ display: "block", marginTop: 16, color: T.muted, fontSize: 14, textDecoration: "none" }}>← Back to Home</Link>
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
    <div style={{ position: "fixed", inset: 0, background: T.bg, display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Admin Test Mode Banner */}
      {isAdmin && (
        <div style={{ background: !contractor ? T.amber : "#4a2500", color: "#fff", fontSize: 12, fontWeight: 800, textAlign: "center", paddingTop: 6, paddingBottom: 6, paddingLeft: 16, paddingRight: 16 }}>
          {!contractor ? '⚠️ ADMIN TEST MODE — No contractor profile linked to your account' : '🔧 ADMIN TEST MODE — Tier restrictions bypassed'}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Hamburger */}
        <FieldOpsHamburgerMenu onToggleSidebar={setSidebarOpen} />

        {/* Sidebar — Desktop visible, Mobile overlay */}
        <div className={`${
          sidebarOpen ? 'fixed inset-0 z-50 lg:static lg:z-auto' : 'hidden lg:block'
        }`}>
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className={`${sidebarOpen ? 'fixed left-0 top-0 h-full w-64 z-40' : ''}`}>
            <WaveFOSidebar
              contractor={effectiveContractor}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSidebarOpen(false);
              }}
              hasBreakerAccess={hasSurfCoastWaveOSAccess}
              isOnline={isOnline}
            />
          </div>
        </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <h1 className="text-slate-800 font-semibold text-lg">
            {NAV_TABS.find(t => t.id === activeTab)?.label || 'WAVE OS'}
          </h1>
          <Link to="/ContractorAccount" className="relative p-2 mr-1 group flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xl:inline">Portal</span>
          </Link>
          <button className="relative p-2">
            <Bell className="w-5 h-5 text-slate-500" />
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
          hasBreakerAccess={hasSurfCoastWaveOSAccess}
          isOnline={isOnline}
          notifCount={notifCount}
        />

        {/* Mobile Back Button */}
        <div className="lg:hidden flex items-center bg-white border-b border-slate-200 px-4 py-2">
          <Link to="/ContractorAccount" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm">
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
            <div className="p-4">
              <SupplyHousesFinder
                contractor={effectiveContractor}
                isOpen={true}
                onClose={() => setActiveTab('jobs')}
                inline={true}
              />
            </div>
          )}
          {activeTab === 'breaker' && <SurfCoastWaveFOView contractor={effectiveContractor} user={user} />}
        </div>
      </div>
      </div>

      {/* WAVE OS AI Assistant — Ripple & Swell tiers only */}
      {showWaveOSAssistant && (
        <WaveFOAssistant
          contractor={effectiveContractor}
          activeTab={activeTab}
        />
      )}


    </div>
  );
}