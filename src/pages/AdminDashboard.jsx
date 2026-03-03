import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, Users, CheckCircle2, Clock, 
  CreditCard, TrendingUp, ShieldCheck, Download,
  MessageSquare, ShieldAlert, Eye, EyeOff
} from 'lucide-react';

const ADMIN_PASSWORD = 'contractorhub2024';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date'),
    enabled: authed,
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
    a.download = `contractorhub-fees-${new Date().toISOString().split('T')[0]}.csv`;
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
            <p className="text-sm text-slate-500 mt-1">ContractorHub Fee Dashboard</p>
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
            <p className="text-slate-400 mt-1 text-sm">All platform access fees — ContractorHub</p>
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

        {/* Payments Table */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">All Fee Transactions</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No fee transactions yet.</div>
          ) : (
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.status === 'confirmed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">{p.payer_name}</div>
                      <div className="text-xs text-slate-500 truncate">{p.payer_email}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{p.purpose}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <Badge className={p.payer_type === 'contractor' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}>
                      {p.payer_type}
                    </Badge>
                    <span className="font-bold text-slate-900">${(p.amount || 0).toFixed(2)}</span>
                    <span className="text-xs text-slate-400">{new Date(p.created_date).toLocaleDateString()}</span>
                    {p.status === 'pending' ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => confirmMutation.mutate(p.id)}
                        disabled={confirmMutation.isPending}
                      >
                        Mark Confirmed
                      </Button>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-slate-400 pb-4">
          All fees are $1.50 USD per transaction. Disclosed upfront per California SB 478 (Honest Pricing Law). 
          Platform operated in California. Consult a licensed accountant for tax reporting obligations.
        </p>
      </div>
    </div>
  );
}