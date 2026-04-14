import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContractorVerificationCard from '@/components/admin/ContractorVerificationCard';

export default function ContractorVerificationDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState('all');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser && currentUser.role === 'admin') {
          setUser(currentUser);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['pending-verification-contractors'],
    queryFn: async () => {
      try {
        const all = await base44.asServiceRole.entities.Contractor.list();
        return (all || []).filter(c => c.admin_review_requested === true);
      } catch (error) {
        console.error('Failed to fetch contractors:', error);
        return [];
      }
    },
    enabled: isAdmin,
  });

  const filteredContractors = contractors.filter(c => {
    if (filterVerified === 'verified') return c.identity_verified === true;
    if (filterVerified === 'unverified') return c.identity_verified !== true;
    return true;
  });

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#EBEBEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 40, height: 40, color: "#555" }} className="animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, padding: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: 48, height: 48, color: "#cc0000", margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Access Denied</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>You must be an admin to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Contractor Verification</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Review contractors requesting admin verification</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-slate-900">{contractors.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Verified</p>
            <p className="text-3xl font-bold text-green-600">
              {contractors.filter(c => c.identity_verified).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Unverified</p>
            <p className="text-3xl font-bold text-yellow-600">
              {contractors.filter(c => !c.identity_verified).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <Button
            variant={filterVerified === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterVerified('all')}
          >
            All ({contractors.length})
          </Button>
          <Button
            variant={filterVerified === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterVerified('verified')}
          >
            Verified ({contractors.filter(c => c.identity_verified).length})
          </Button>
          <Button
            variant={filterVerified === 'unverified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterVerified('unverified')}
          >
            Unverified ({contractors.filter(c => !c.identity_verified).length})
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Loading contractors...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error loading contractors</p>
            <p className="text-red-700 text-sm mt-1">{error.message}</p>
          </div>
        ) : filteredContractors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600">No contractors match the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContractors.map(contractor => (
              <ContractorVerificationCard key={contractor.id} contractor={contractor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}