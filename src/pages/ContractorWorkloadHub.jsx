import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import MyDayView from '@/components/workload/MyDayView';
import WorkloadCalendar from '@/components/workload/WorkloadCalendar';
import RouteOptimizer from '@/components/workload/RouteOptimizer';
import AvailabilityStatusManager from '@/components/workload/AvailabilityStatusManager';
import OfflineStatusBar from '@/components/workload/OfflineStatusBar';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function ContractorWorkloadHub() {
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [activeTab, setActiveTab] = useState('day'); // 'day', 'calendar', 'route'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { isOnline, isSyncing, syncError, pendingCount, lastSyncTime, syncPendingChanges } = useOfflineSync(user?.email);

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch contractor profile
  const { data: contractorProfile, isLoading: contractorLoading } = useQuery({
    queryKey: ['contractor', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const contractors = await base44.entities.Contractor.filter({
        email: user.email,
      });
      return contractors[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (contractorProfile) {
      setContractor(contractorProfile);
    }
  }, [contractorProfile]);

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: 48, height: 48, color: T.amber, margin: "0 auto 16px" }} />
          <p style={{ fontSize: 18, color: T.muted, fontStyle: "italic" }}>Please log in to access your workload hub.</p>
        </div>
      </div>
    );
  }

  if (contractorLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: 48, height: 48, color: T.amber, margin: "0 auto 16px" }} />
          <p style={{ fontSize: 18, color: T.muted, fontStyle: "italic" }}>Contractor profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <OfflineStatusBar
        isOnline={isOnline}
        isSyncing={isSyncing}
        syncError={syncError}
        pendingCount={pendingCount}
        lastSyncTime={lastSyncTime}
        onRetrySync={syncPendingChanges}
      />
      <div style={{ maxWidth: 1280, margin: "0 auto", paddingLeft: 16, paddingRight: 16, paddingTop: 32, paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>
            {contractor.name}, Your Workload Hub
          </h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Manage your schedule, jobs, and routes all in one place.</p>
        </div>

        {/* Status Manager */}
        <div className="mb-8">
          <AvailabilityStatusManager contractor={contractor} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'day'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Day
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('route')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'route'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Route
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {activeTab === 'day' && <MyDayView contractor={contractor} selectedDate={selectedDate} />}
          {activeTab === 'calendar' && (
            <WorkloadCalendar contractor={contractor} onSelectDate={setSelectedDate} />
          )}
          {activeTab === 'route' && <RouteOptimizer contractor={contractor} selectedDate={selectedDate} />}
        </div>
      </div>
    </div>
  );
}