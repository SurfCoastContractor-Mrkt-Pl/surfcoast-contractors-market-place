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

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">Please sign in to access your customer portal.</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      pending_ratings: 'bg-purple-100 text-purple-800',
      closed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Work Portal</h1>
          <p className="text-slate-600 mt-2">Welcome, {user.full_name}. Track your projects and communications here.</p>
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