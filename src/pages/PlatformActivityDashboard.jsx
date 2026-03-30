import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Briefcase, TrendingUp, Loader2, AlertCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlatformActivityDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setIsAdmin(me?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['platformActivity'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getPlatformActivitySummary', {});
      return response.data;
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Only</h1>
          <p className="text-slate-600 mb-6">You must be an admin to access this dashboard.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading platform metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, last30Days } = data || {};

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2">+{trend} this month</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Platform Activity Dashboard</h1>
          </div>
          <p className="text-slate-600">Overall platform metrics and activity summary</p>
        </div>

        {/* All-Time Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">All-Time Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Customers"
              value={summary?.totalCustomers || 0}
            />
            <StatCard
              icon={Briefcase}
              label="Total Contractors"
              value={summary?.totalContractors || 0}
            />
            <StatCard
              icon={BarChart3}
              label="Completed Jobs"
              value={summary?.totalCompletedJobs || 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`$${summary?.totalRevenue || '0.00'}`}
            />
          </div>
        </div>

        {/* Last 30 Days */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Last 30 Days</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="New Customers"
              value={last30Days?.newCustomers || 0}
            />
            <StatCard
              icon={Briefcase}
              label="New Contractors"
              value={last30Days?.newContractors || 0}
            />
            <StatCard
              icon={BarChart3}
              label="Jobs Completed"
              value={last30Days?.completedJobs || 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue Generated"
              value={`$${last30Days?.revenue || '0.00'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}