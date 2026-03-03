import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Trash2, Search, CheckCircle2, Clock, FileText, CalendarCheck, LogOut } from 'lucide-react';
import JobCloseout from '@/components/scopeofwork/JobCloseout';

export default function CustomerAccount() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const [closeoutScope, setCloseoutScope] = useState(null);
  const queryClient = useQueryClient();

  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['customer-payments', searchEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: searchEmail, payer_type: 'customer' }),
    enabled: searched && !!searchEmail,
  });

  const { data: disclaimers, isLoading: loadingDisclaimers } = useQuery({
    queryKey: ['customer-disclaimers', searchEmail],
    queryFn: () => base44.entities.DisclaimerAcceptance.filter({ customer_email: searchEmail }),
    enabled: searched && !!searchEmail,
  });

  const { data: scopes, isLoading: loadingScopes } = useQuery({
    queryKey: ['customer-scopes', searchEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ customer_email: searchEmail }),
    enabled: searched && !!searchEmail,
  });

  // Old postings = payments the customer made that are now work_scheduled
  const { data: oldPostings } = useQuery({
    queryKey: ['customer-old-postings', searchEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: searchEmail, payer_type: 'customer', status: 'work_scheduled' }),
    enabled: searched && !!searchEmail,
  });

  const deleteDisclaimerMutation = useMutation({
    mutationFn: (id) => base44.entities.DisclaimerAcceptance.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-disclaimers'] }),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-payments'] }),
  });

  const isLoading = loadingPayments || loadingDisclaimers || loadingScopes;
  const hasData = searched && !isLoading && (payments?.length > 0 || disclaimers?.length > 0 || scopes?.length > 0);

  const handleDeleteAll = async () => {
    await Promise.all([
      ...(disclaimers || []).map(d => base44.entities.DisclaimerAcceptance.delete(d.id)),
      ...(payments || []).map(p => base44.entities.Payment.delete(p.id)),
    ]);
    queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
    queryClient.invalidateQueries({ queryKey: ['customer-disclaimers'] });
    queryClient.invalidateQueries({ queryKey: ['customer-scopes'] });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Customer Account</h1>
              <p className="text-slate-300">Manage your activity and data</p>
            </div>
          </div>
        </div>
      </div>

      <JobCloseout scope={closeoutScope} role="customer" open={!!closeoutScope} onClose={() => { setCloseoutScope(null); queryClient.invalidateQueries({ queryKey: ['customer-scopes', searchEmail] }); }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Email Lookup */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Look Up Your Account</h2>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={searchEmail}
              onChange={(e) => { setSearchEmail(e.target.value); setSearched(false); }}
              className="flex-1"
            />
            <Button
              onClick={() => setSearched(true)}
              disabled={!searchEmail}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <Search className="w-4 h-4 mr-2" />
              Find
            </Button>
          </div>
        </Card>

        {searched && !isLoading && !hasData && (
          <Card className="p-6 text-center text-slate-500">No account data found for that email.</Card>
        )}

        {hasData && (
          <>
            <Tabs defaultValue="payments">
              <TabsList className="w-full">
                <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
                <TabsTrigger value="scopes" className="flex-1">Scope of Work</TabsTrigger>
                <TabsTrigger value="old-postings" className="flex-1 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4" /> Old Postings
                  {oldPostings?.length > 0 && (
                    <span className="ml-1 bg-green-100 text-green-700 text-xs rounded-full px-1.5">{oldPostings.length}</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payments">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Fee Payments</h2>
                  {payments?.filter(p => p.status !== 'work_scheduled').length > 0 ? (
                    <div className="space-y-3">
                      {payments.filter(p => p.status !== 'work_scheduled').map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {p.status === 'confirmed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-800">${p.amount?.toFixed(2)} — {p.purpose}</div>
                              <div className="text-xs text-slate-500">{new Date(p.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <Badge className={p.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {p.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No active payments found.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="scopes">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Scope of Work Agreements</h2>
                  {scopes?.length > 0 ? (
                    <div className="space-y-3">
                      {scopes.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{s.job_title}</div>
                              <div className="text-xs text-slate-500">Contractor: {s.contractor_name} — {s.cost_type === 'fixed' ? `$${s.cost_amount} fixed` : `$${s.cost_amount}/hr`}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={
                              s.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                              s.status === 'approved' ? 'bg-green-100 text-green-700' :
                              s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {s.status === 'pending_approval' ? 'Pending' : s.status}
                            </Badge>
                            {s.status !== 'closed' && s.status !== 'rejected' && (
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-green-300 text-green-700 hover:bg-green-50" onClick={() => setCloseoutScope(s)}>
                                <LogOut className="w-3 h-3 mr-1" /> Close Out
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No scope of work agreements found.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="old-postings">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Old Postings</h2>
                  <p className="text-xs text-slate-500 mb-4">Contractor engagements that have been marked as "Work Scheduled" — these jobs are no longer publicly listed.</p>
                  {oldPostings?.length > 0 ? (
                    <div className="space-y-3">
                      {oldPostings.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CalendarCheck className="w-5 h-5 text-green-600 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-slate-800">{p.purpose || 'Contractor engagement'}</div>
                              <div className="text-xs text-slate-500">Contractor email: {p.contractor_email || 'N/A'}</div>
                              <div className="text-xs text-slate-400">{new Date(p.updated_date || p.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Work Scheduled</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No old postings yet.</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            {/* Delete Profile */}
            <Card className="p-6 border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Delete My Account Data</h2>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete all your account data including signed disclaimers, payment records, and activity. This cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Account Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all records associated with <strong>{searchEmail}</strong>, including signed disclaimers and payment records. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAll}>
                      Yes, Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}