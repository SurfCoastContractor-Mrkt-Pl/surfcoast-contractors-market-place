import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import MyDayView from '@/components/workload/MyDayView';
import WorkloadCalendar from '@/components/workload/WorkloadCalendar';
import RouteOptimizer from '@/components/workload/RouteOptimizer';
import AvailabilityStatusManager from '@/components/workload/AvailabilityStatusManager';

export default function ContractorWorkloadHub() {
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [activeTab, setActiveTab] = useState('day'); // 'day', 'calendar', 'route'
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-slate-700">Please log in to access your workload hub.</p>
        </div>
      </div>
    );
  }

  if (contractorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-orange-600"></div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-slate-700">Contractor profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {contractor.name}, Your Workload Hub
          </h1>
          <p className="text-slate-600">Manage your schedule, jobs, and routes all in one place.</p>
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