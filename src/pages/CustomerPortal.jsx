import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, FileText, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function CustomerPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const { data: scopes = [] } = useQuery({
    queryKey: ['customerScopes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.ScopeOfWork.filter({ customer_email: user.email });
    },
    enabled: !!user?.email
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['customerPayments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Payment.filter({ payer_email: user.email });
    },
    enabled: !!user?.email
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['customerMessages', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Message.filter({ recipient_email: user.email });
    },
    enabled: !!user?.email
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

  if (loading) return <div style={{ padding: 24, textAlign: "center", background: T.bg, minHeight: "100vh" }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 448, background: T.card, border: "0.5px solid " + T.border, borderRadius: 10, boxShadow: T.shadow, overflow: "hidden" }}>
          <div style={{ padding: 24, borderBottom: "0.5px solid " + T.border }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.dark, margin: 0, fontStyle: "italic" }}>Sign In Required</h2>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: T.muted, marginBottom: 16, fontStyle: "italic" }}>Please sign in to access your customer portal.</p>
            <button onClick={() => base44.auth.redirectToLogin()} style={{ width: "100%", padding: "12px 16px", background: T.amber, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending_approval: { bg: "#FBF5EC", text: T.amber },
      approved: { bg: "#E3F2FD", text: "#1A73E8" },
      pending_ratings: { bg: "#F3E5F5", text: "#6A1B9A" },
      closed: { bg: "#E8F5E9", text: "#2E7D32" },
      rejected: { bg: "#FFEBEE", text: "#C62828" }
    };
    return colors[status] || { bg: "#F5F5F5", text: "#424242" };
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>My Work Portal</h1>
          <p style={{ color: T.muted, marginTop: 8, fontStyle: "italic" }}>Welcome, {user.full_name}. Track your projects and communications here.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{scopes.length}</div>
              <p className="text-slate-600 text-sm">Active Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}</div>
              <p className="text-slate-600 text-sm">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{scopes.filter(s => s.status === 'closed').length}</div>
              <p className="text-slate-600 text-sm">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{messages.filter(m => !m.read).length}</div>
              <p className="text-slate-600 text-sm">Unread Messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {scopes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  No active projects. When you post a job, it will appear here.
                </CardContent>
              </Card>
            ) : (
              scopes.map(scope => (
                <Card key={scope.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{scope.job_title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">Contractor: {scope.contractor_name}</p>
                      </div>
                      <Badge className={getStatusColor(scope.status)}>
                        {scope.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Scope Summary</p>
                      <p className="text-sm text-slate-600 mt-1">{scope.scope_summary || 'No details yet'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-wide">Cost</p>
                        <p className="text-lg font-semibold text-slate-900">${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : ''}</p>
                      </div>
                      {scope.agreed_work_date && (
                        <div>
                          <p className="text-xs text-slate-600 uppercase tracking-wide">Work Date</p>
                          <p className="text-sm text-slate-900">{new Date(scope.agreed_work_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    {scope.status === 'pending_approval' && (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Review & Approve
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {payments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  No payment history yet.
                </CardContent>
              </Card>
            ) : (
              payments.map(payment => (
                <Card key={payment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{payment.purpose}</p>
                        <p className="text-sm text-slate-600">{new Date(payment.created_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">${payment.amount.toFixed(2)}</p>
                        <Badge variant="outline">{payment.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            {messages.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  No messages yet. Contractors will message you here.
                </CardContent>
              </Card>
            ) : (
              messages.map(message => (
                <Card key={message.id} className={message.read ? '' : 'border-blue-200 bg-blue-50'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{message.sender_name}</p>
                        <p className="text-sm text-slate-600">{new Date(message.created_date).toLocaleDateString()}</p>
                      </div>
                      {!message.read && <Badge className="bg-blue-600">New</Badge>}
                    </div>
                    <p className="text-slate-700 mt-3">{message.body}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}