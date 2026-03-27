import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import PerformanceAnalyticsDashboard from '@/components/contractor/PerformanceAnalyticsDashboard';

export default function SurfCoastPerformanceDashboard() {
  const [contractor, setContractor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const contractors = await base44.entities.Contractor.filter({
          email: currentUser.email,
        });

        if (contractors && contractors.length > 0) {
          setContractor(contractors[0]);
        } else {
          setError('Contractor profile not found');
        }
      } catch (err) {
        setError('Failed to load contractor data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="border-red-200 bg-red-50 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="border-slate-200 max-w-2xl">
          <CardHeader>
            <CardTitle>SurfCoast Performance Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">No contractor profile found. Please complete your contractor setup.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">SurfCoast Performance Dashboard</h1>
          <p className="text-slate-600 mt-2">Track your earnings, completion rates, and customer satisfaction metrics.</p>
        </div>

        <PerformanceAnalyticsDashboard
          contractorEmail={contractor.email}
          tierLevel={contractor.profile_tier || 'standard'}
        />
      </div>
    </div>
  );
}