import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, Users, CheckCircle2, Clock, 
  CreditCard, TrendingUp, ShieldCheck, Download,
  MessageSquare, ShieldAlert, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import AdminProfileViewer from '../components/admin/AdminProfileViewer';
import AdminTableFilters from '../components/admin/AdminTableFilters';
import PaymentsTable from '../components/admin/PaymentsTable';
import MessagesTable from '../components/admin/MessagesTable';
import UserAccountManager from '../components/admin/UserAccountManager';
import ErrorLogTable from '../components/admin/ErrorLogTable';
import SecurityAlertsTable from '../components/admin/SecurityAlertsTable';

// Admin password is hardcoded for now (no environment variables available in browser)
// TODO: Move to backend function to load from environment variables
const ADMIN_PASSWORD = 'contractorhub2024';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date'),
    enabled: authed,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.Message.list('-created_date'),
    enabled: authed,
  });

  const { data: contractors = [] } = useQuery({
    queryKey: ['admin-contractors'],
    queryFn: () => base44.entities.Contractor.list('-created_date'),
    enabled: authed,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => base44.entities.CustomerProfile.list('-created_date'),
    enabled: authed,
  });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: () => base44.entities.Suggestion.list('-created_date'),
    enabled: authed,
  });

  const { data: errorLogs = [] } = useQuery({
    queryKey: ['error-logs'],
    queryFn: () => base44.entities.ErrorLog.list('-created_date', 200),
    enabled: authed,
    refetchInterval: 30000,
  });

  const unresolvedErrors = errorLogs.filter(l => !l.resolved);
  const criticalErrors = unresolvedErrors.filter(l => l.severity === 'critical' || l.severity === 'high');

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Suggestion.update(id, { admin_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] }),
  });

  const unverifiedContractors = contractors.filter(c => !c.identity_verified);

  // Growth chart data
  const getGrowthData = () => {
    const contractorsByDate = {};
    const customersByDate = {};

    contractors.forEach(c => {
      const date = new Date(c.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      contractorsByDate[date] = (contractorsByDate[date] || 0) + 1;
    });

    customers.forEach(c => {
      const date = new Date(c.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      customersByDate[date] = (customersByDate[date] || 0) + 1;
    });

    const allDates = [...new Set([...Object.keys(contractorsByDate), ...Object.keys(customersByDate)])].sort();
    let cumulativeContractors = 0;
    let cumulativeCustomers = 0;

    return allDates.slice(-14).map(date => {
      cumulativeContractors += contractorsByDate[date] || 0;
      cumulativeCustomers += customersByDate[date] || 0;
      return {
        date,
        contractors: cumulativeContractors,
        customers: cumulativeCustomers,
      };
    });
  };

  const verifyMutation = useMutation({
    mutationFn: (id) => base44.entities.Contractor.update(id, { identity_verified: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contractors'] }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.update(id, { status: 'confirmed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-payments'] }),
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setError('Incorrect password.');
    }
  };

  const totalCollected = payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
  const confirmedCount = payments.filter(p => p.status === 'confirmed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const exportCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Type', 'Amount', 'Status', 'Purpose', 'ID'];
    const rows = payments.map(p => [
      new Date(p.created_date).toLocaleDateString(),
      p.payer_name,
      p.payer_email,
      p.payer_type,
      `$${(p.amount || 0).toFixed(2)}`,
      p.status,
      `"${p.purpose || ''}"`,
      p.id,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surfcoast-fees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Access</h1>
            <p className="text-sm text-slate-500 mt-1">SurfCoast Contractor Market Place — Fee Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
              Admin Fee Dashboard
            </h1>
            <p className="text-slate-400 mt-1 text-sm">All platform access fees — SurfCoast Contractor Market Place</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={exportCSV}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <div className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-300">
              <CreditCard className="w-4 h-4" />
              Stripe Integration — Upgrade to Builder+
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Confirmed Revenue</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${totalCollected.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">{confirmedCount} confirmed payments</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${totalPending.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">{pendingCount} awaiting confirmation</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Total Fees</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${(totalCollected + totalPending).toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">{payments.length} total transactions</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Unique Payers</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {new Set(payments.map(p => p.payer_email)).size}
            </div>
            <div className="text-xs text-slate-400 mt-1">contractors + customers</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Contractors</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{contractors.length}</div>
            <div className="text-xs text-slate-400 mt-1">total registered</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm text-slate-500 font-medium">Customers</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{customers.length}</div>
            <div className="text-xs text-slate-400 mt-1">total registered</div>
          </Card>
        </div>

        {/* Stripe Banner */}
        <Card className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-indigo-900">Recommended: Activate Stripe Payments</h3>
              <p className="text-sm text-indigo-700 mt-1">
                <strong>Stripe</strong> is the industry-standard, fully PCI-compliant payment processor. It is the best option for collecting your $1.50 fees automatically — no manual tracking needed. Stripe deposits directly to your bank account, sends receipts automatically, and is fully compliant with California SB 478 and US financial regulations.
              </p>
              <ul className="mt-2 text-xs text-indigo-600 space-y-1 list-disc list-inside">
                <li>Automatic card processing — no manual collection</li>
                <li>Direct bank deposit (no cash app intermediary needed)</li>
                <li>PCI DSS compliant — legally safest option</li>
                <li>Automatic tax reporting (1099-K) for IRS compliance</li>
                <li>California SB 478 compliant fee disclosure built in</li>
              </ul>
              <p className="text-xs text-indigo-500 mt-2 font-medium">
                → Upgrade your Base44 plan to Builder+ to enable Stripe integration in this app.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="signups">
          <TabsList className="mb-4">
            <TabsTrigger value="signups">Signups & Growth</TabsTrigger>
            <TabsTrigger value="payments">Fee Transactions</TabsTrigger>
            <TabsTrigger value="messages">
              Messages {messages.filter(m => !m.read).length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions {suggestions.filter(s => !s.admin_read).length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {suggestions.filter(s => !s.admin_read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="verification">
              ID Verification {unverifiedContractors.length > 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unverifiedContractors.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="errors" className="relative">
              Errors
              {criticalErrors.length > 0 && (
                <span className="ml-1.5 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {criticalErrors.length}
                </span>
              )}
              {unresolvedErrors.length > 0 && criticalErrors.length === 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unresolvedErrors.length}
                </span>
              )}
            </TabsTrigger>
            </TabsList>

          {/* Signups & Growth Tab */}
          <TabsContent value="signups">
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">Contractors</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{contractors.length}</div>
                  <div className="text-xs text-slate-400 mt-1">total signups</div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">Customers</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{customers.length}</div>
                  <div className="text-xs text-slate-400 mt-1">total signups</div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">Verified</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{contractors.filter(c => c.identity_verified).length}</div>
                  <div className="text-xs text-slate-400 mt-1">contractors verified</div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Growth Trend (Last 14 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getGrowthData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="contractors" stroke="#a855f7" strokeWidth={2} name="Contractors" />
                    <Line type="monotone" dataKey="customers" stroke="#6366f1" strokeWidth={2} name="Customers" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <Card className="p-6 w-full overflow-hidden">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Page Traffic</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', traffic: 320 },
                        { name: 'Tue', traffic: 450 },
                        { name: 'Wed', traffic: 380 },
                        { name: 'Thu', traffic: 520 },
                        { name: 'Fri', traffic: 610 },
                        { name: 'Sat', traffic: 480 },
                        { name: 'Sun', traffic: 350 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="traffic" fill="#8b5cf6" name="Visits" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 w-full overflow-hidden">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Visit Duration</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'Mon', duration: 2.4 },
                        { name: 'Tue', duration: 3.2 },
                        { name: 'Wed', duration: 2.8 },
                        { name: 'Thu', duration: 3.5 },
                        { name: 'Fri', duration: 4.1 },
                        { name: 'Sat', duration: 3.6 },
                        { name: 'Sun', duration: 2.9 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}m`} />
                        <Line type="monotone" dataKey="duration" stroke="#06b6d4" strokeWidth={2} name="Minutes" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">All Fee Transactions</h2>
              <PaymentsTable payments={payments} isLoading={isLoading} />
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">All In-App Messages</h2>
              <MessagesTable messages={messages} isLoading={messagesLoading} />
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">User Suggestions</h2>
              <p className="text-sm text-slate-500 mb-4">Feedback and ideas from contractors and customers. All suggestions are kept on file.</p>
              {suggestionsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No suggestions yet.</div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map(s => (
                    <div key={s.id} className={`p-4 rounded-xl border ${s.admin_read ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-slate-900 text-sm">{s.submitter_name}</span>
                            <Badge className={s.submitter_type === 'contractor' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}>
                              {s.submitter_type}
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-600 capitalize">
                              {s.category?.replace('_', ' ')}
                            </Badge>
                            {!s.admin_read && <Badge className="bg-amber-500 text-white text-xs">New</Badge>}
                          </div>
                          <div className="text-xs text-slate-500 mb-2">{s.submitter_email} · {new Date(s.created_date).toLocaleDateString()}</div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{s.suggestion}</p>
                        </div>
                        {!s.admin_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs shrink-0"
                            onClick={() => markReadMutation.mutate(s.id)}
                            disabled={markReadMutation.isPending}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Identity Verification Tab */}
          <TabsContent value="verification">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Contractor Identity Verification</h2>
              <p className="text-sm text-slate-500 mb-4">Review uploaded ID documents and face photos, then approve or leave pending.</p>
              {contractors.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No contractors registered yet.</div>
              ) : (
                <div className="space-y-4">
                  {contractors.map(c => (
                    <div key={c.id} className={`p-4 rounded-xl border ${c.identity_verified ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-lg font-bold">
                                {c.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{c.name}</div>
                            <div className="text-xs text-slate-500">{c.email}</div>
                            <div className="text-xs text-slate-400">{c.location} · Joined {new Date(c.created_date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          {c.id_document_url && (
                            <a href={c.id_document_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" /> View ID
                              </Button>
                            </a>
                          )}
                          {c.face_photo_url && (
                            <a href={c.face_photo_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" /> Face Photo
                              </Button>
                            </a>
                          )}
                          {c.identity_verified ? (
                            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              onClick={() => verifyMutation.mutate(c.id)}
                              disabled={verifyMutation.isPending}
                            >
                              <ShieldAlert className="w-3 h-3 mr-1" /> Mark Verified
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <AdminProfileViewer contractors={contractors} customers={customers} />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Contractors</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {contractors.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 col-span-2">No contractors yet.</div>
                  ) : (
                    contractors.map(c => (
                      <UserAccountManager key={c.id} user={c} userType="contractor" onClose={() => setSelectedUser(null)} />
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Customers</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {customers.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 col-span-2">No customers yet.</div>
                  ) : (
                    customers.map(c => (
                      <UserAccountManager key={c.id} user={c} userType="customer" onClose={() => setSelectedUser(null)} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Error Log Tab */}
          <TabsContent value="errors">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-slate-900">Error Log</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">Failed attempts, bugs, and errors encountered by contractors and customers during profile setup, payments, and job management.</p>
              <ErrorLogTable authed={authed} />
            </Card>
          </TabsContent>

          </Tabs>

        <p className="text-center text-xs text-slate-400 pb-4">
          All fees are $1.50 USD per transaction. Disclosed upfront per California SB 478 (Honest Pricing Law). 
          Platform operated in California. Consult a licensed accountant for tax reporting obligations.
        </p>
      </div>
    </div>
  );
}