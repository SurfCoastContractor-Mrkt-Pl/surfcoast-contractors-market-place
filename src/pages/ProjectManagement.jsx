import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import ProjectOverview from '@/components/projects/ProjectOverview';
import DisputeInitiationForm from '@/components/disputes/DisputeInitiationForm';
import DisputeDetailModal from '@/components/disputes/DisputeDetailModal';
import AdminDisputeReview from '@/components/disputes/AdminDisputeReview';

export default function ProjectManagement() {
  const [searchParams] = useSearchParams();
  const scopeId = searchParams.get('scopeId');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser?.role === 'admin');
    };
    loadUser();
  }, []);

  // Fetch scope details
  const { data: scope, isLoading: scopeLoading } = useQuery({
    queryKey: ['scope', scopeId],
    queryFn: async () => {
      if (!scopeId) return null;
      const scopes = await base44.entities.ScopeOfWork.filter({ id: scopeId });
      return scopes?.[0] || null;
    },
    enabled: !!scopeId,
  });

  // Fetch disputes related to this scope
  const { data: disputes = [], refetch: refetchDisputes } = useQuery({
    queryKey: ['scope-disputes', scopeId, user?.email],
    queryFn: async () => {
      if (!scopeId || !user?.email) return [];
      const allDisputes = await base44.entities.Dispute.filter({ scope_id: scopeId });
      return (allDisputes || []).filter(
        d => d.initiator_email === user.email || d.respondent_email === user.email || isAdmin
      );
    },
    enabled: !!scopeId && !!user?.email,
  });

  if (!scopeId) {
    // Redirect to dashboard where users can pick an active scope
    navigate('/Dashboard', { replace: true });
    return null;
  }

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (scopeLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Loader2 style={{ width: 32, height: 32, animation: "spin 0.8s linear infinite", color: T.amber }} />
      </div>
    );
  }

  if (!scope) {
    return (
      <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 8, background: "#FFEBEE", border: "0.5px solid #d32f2f" }}>
            <AlertCircle style={{ width: 20, height: 20, color: "#d32f2f", flexShrink: 0 }} />
            <p style={{ color: "#c62828", fontStyle: "italic" }}>Project not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const isContractor = scope.contractor_email === user?.email;
  const isCustomer = scope.customer_email === user?.email;
  const canInitiateDispute = isContractor || isCustomer || isAdmin;

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>{scope.job_title}</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>
            {isContractor ? `Client: ${scope.customer_name}` : `Contractor: ${scope.contractor_name}`}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Project Overview</TabsTrigger>
            {canInitiateDispute && <TabsTrigger value="dispute">Open Dispute</TabsTrigger>}
            {isAdmin && <TabsTrigger value="admin">Admin Review</TabsTrigger>}
          </TabsList>

          {/* Project Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProjectOverview scope={scope} disputes={disputes} />
          </TabsContent>

          {/* Dispute Initiation Tab */}
          {canInitiateDispute && (
            <TabsContent value="dispute" className="space-y-6">
              {disputes.length > 0 && (
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '16px' }}>
                  <h3 className="font-semibold text-white mb-4">Active Disputes</h3>
                  <div className="space-y-3">
                    {disputes.map(dispute => (
                      <button
                        key={dispute.id}
                        onClick={() => setSelectedDispute(dispute)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <p className="text-white font-medium">{dispute.title}</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          Status: <span style={{ color: dispute.status === 'open' ? '#fbbf24' : '#4ade80' }}>{dispute.status}</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <DisputeInitiationForm scope={scope} user={user} onDisputeCreated={refetchDisputes} />
              {selectedDispute && (
                <DisputeDetailModal dispute={selectedDispute} user={user} isAdmin={isAdmin} onClose={() => setSelectedDispute(null)} onUpdate={refetchDisputes} />
              )}
            </TabsContent>
          )}

          {/* Admin Review Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminDisputeReview scopeId={scopeId} disputes={disputes} onUpdate={refetchDisputes} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}