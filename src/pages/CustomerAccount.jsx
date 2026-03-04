import React, { useState } from 'react';
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
import { User, Trash2, Search, CheckCircle2, Clock, FileText, CalendarCheck, LogOut, Settings, Lock, Mail, HelpCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import JobCloseout from '@/components/scopeofwork/JobCloseout';
import CustomerProfileDisplay from '@/components/customer/CustomerProfileDisplay';
import CustomerWelcomeModal from '@/components/customer/CustomerWelcomeModal';
import CustomerProfileEditor from '@/components/customer/CustomerProfileEditor';
import FloatingAgentWidget from '@/components/agent/FloatingAgentWidget';
import SavedPaymentMethods from '@/components/payment/SavedPaymentMethods';
import CustomerBadges from '@/components/badges/CustomerBadges';

export default function CustomerAccount() {
  const [closeoutScope, setCloseoutScope] = useState(null);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin();
          return;
        }
        setUserEmail(user.email);
        
        // Check if this is a new customer (no profile yet)
        const profiles = await base44.entities.CustomerProfile.filter({ email: user.email });
        if (!profiles || profiles.length === 0) {
          setShowWelcome(true);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['customer-payments', userEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: userEmail, payer_type: 'customer' }),
    enabled: !!userEmail,
  });

  const { data: disclaimers, isLoading: loadingDisclaimers } = useQuery({
    queryKey: ['customer-disclaimers', userEmail],
    queryFn: () => base44.entities.DisclaimerAcceptance.filter({ customer_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: scopes, isLoading: loadingScopes } = useQuery({
    queryKey: ['customer-scopes', userEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ customer_email: userEmail }),
    enabled: !!userEmail,
  });

  // Old postings = payments the customer made that are now work_scheduled
  const { data: oldPostings } = useQuery({
    queryKey: ['customer-old-postings', userEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: userEmail, payer_type: 'customer', status: 'work_scheduled' }),
    enabled: !!userEmail,
  });

  const { data: customerProfile } = useQuery({
    queryKey: ['customer-profile', userEmail],
    queryFn: () => base44.entities.CustomerProfile.filter({ email: userEmail }),
    enabled: !!userEmail,
    select: (data) => data[0],
  });

  const { data: postedJobs } = useQuery({
    queryKey: ['customer-jobs', userEmail],
    queryFn: () => base44.entities.Job.filter({ poster_email: userEmail }),
    enabled: !!userEmail,
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

  const handleDeleteAll = async () => {
    try {
      // Use cascading delete function
      const response = await base44.functions.invoke('deleteAccountCascading', {
        accountType: 'customer',
        accountEmail: userEmail,
      });
      
      if (response.data?.success) {
        base44.auth.logout();
      }
    } catch (error) {
      alert(`Error deleting account: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-slate-900 animate-spin" />
          </div>
          <p className="text-slate-600">Loading your account...</p>
        </div>
      </div>
    );
  }

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

      <CustomerWelcomeModal 
        open={showWelcome} 
        onClose={() => setShowWelcome(false)}
        onStartWithAgent={() => {
          setShowWelcome(false);
          setAgentOpen(true);
        }}
      />

      <FloatingAgentWidget 
        open={agentOpen} 
        onClose={() => setAgentOpen(false)}
      />

      <JobCloseout scope={closeoutScope} role="customer" open={!!closeoutScope} onClose={() => { setCloseoutScope(null); queryClient.invalidateQueries({ queryKey: ['customer-scopes', userEmail] }); }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
         {/* Auth Button */}
         <div className="flex gap-3">
           <Button
             variant="outline"
             onClick={() => base44.auth.logout()}
           >
             <LogOut className="w-4 h-4 mr-2" />
             Logout
           </Button>
         </div>

         {/* Tabs - always visible */}
         <Tabs defaultValue="profile">
              <TabsList className="w-full grid-cols-5">
                <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
                <TabsTrigger value="post-job" className="text-xs sm:text-sm flex items-center gap-1.5">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />Post Job
                </TabsTrigger>
                <TabsTrigger value="scopes" className="text-xs sm:text-sm">Scopes</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm"><Settings className="w-3 h-3 sm:w-4 sm:h-4" /></TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <CustomerProfileEditor
                  profile={customerProfile}
                  userEmail={userEmail}
                  onAskAgent={() => setAgentOpen(true)}
                />
              </TabsContent>

              <TabsContent value="post-job">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Post a New Job</h2>
                  <p className="text-slate-600 mb-6">
                    Post a job to find qualified contractors. You'll need to provide a detailed description and upload at least 5 before photos.
                  </p>
                  <Link to={createPageUrl('PostJob')}>
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Go to Job Posting Form
                    </Button>
                  </Link>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Fee Payments</h2>
                  {payments?.filter(p => p.status !== 'work_scheduled').length > 0 ? (
                     <div className="space-y-3">
                       {payments.filter(p => p.status !== 'work_scheduled').map(p => (
                         <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             {p.status === 'confirmed' ? (
                               <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                             ) : (
                               <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                             )}
                             <div className="min-w-0">
                               <div className="text-sm font-medium text-slate-800">${p.amount?.toFixed(2)} — {p.purpose}</div>
                               <div className="text-xs text-slate-500">{new Date(p.created_date).toLocaleDateString()}</div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                             {p.status === 'confirmed' && (
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="text-xs h-7 px-2"
                                 onClick={() => base44.functions.invoke('generatePaymentInvoice', { paymentId: p.id })}
                               >
                                 📄 Invoice
                               </Button>
                             )}
                             <Badge className={p.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                               {p.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                             </Badge>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-slate-500">No active payments found.</p>
                   )}
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-4">
                  {/* Payment Methods */}
                  {userEmail && <SavedPaymentMethods userEmail={userEmail} />}

                  {/* Account Security */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Lock className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Account Security</h3>
                        <p className="text-sm text-slate-500">Your login credentials are managed by ContractorHub's secure authentication system.</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full"
                    >
                      Change Password
                    </Button>
                    <p className="text-xs text-slate-400 mt-2">You'll be securely logged out and directed to reset your password.</p>
                  </Card>

                  {/* Email Preferences */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Contact Email</h3>
                        <p className="text-sm text-slate-500">{userEmail}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">All notifications and account communications are sent to this email address. To change it, you'll need to contact support.</p>
                    <Button variant="outline" disabled className="w-full opacity-50">
                      Update Email (Coming Soon)
                    </Button>
                  </Card>

                  {/* Logout */}
                  <Card className="p-6 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 mb-2">Session</h3>
                    <p className="text-sm text-slate-500 mb-4">Log out from your account on this device.</p>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => base44.auth.logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="scopes">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Scope of Work Agreements</h2>
                  {scopes?.length > 0 ? (
                    <div className="space-y-3">
                      {scopes.map(s => (
                        <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-slate-50 gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800 truncate">{s.job_title}</div>
                                <div className="text-xs text-slate-500">Contractor: {s.contractor_name} — {s.cost_type === 'fixed' ? `$${s.cost_amount} fixed` : s.cost_type === 'quote' ? `Quote: $${s.cost_amount}` : `$${s.cost_amount}/hr`}</div>
                              </div>
                            </div>
                            <Badge className={
                              s.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                              s.status === 'approved' ? 'bg-green-100 text-green-700' :
                              s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {s.status === 'pending_approval' ? 'Pending' : s.status}
                            </Badge>
                          </div>
                          {s.status === 'pending_approval' && (
                            <div className="p-3 bg-amber-50 border-t border-slate-200 space-y-2">
                              <p className="text-xs text-amber-800 font-medium">Action Required: Approve or Reject this scope</p>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                                  onClick={async () => {
                                    await base44.entities.ScopeOfWork.update(s.id, { status: 'approved' });
                                    // Notify contractor of approval
                                    await base44.integrations.Core.SendEmail({
                                      to: s.contractor_email,
                                      subject: `✅ Scope Approved: "${s.job_title}"`,
                                      body: `Dear ${s.contractor_name},\n\nThe customer ${s.customer_name} has approved your scope of work for "${s.job_title}". You can now proceed with the work as agreed.\n\nContractorHub`,
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['customer-scopes', userEmail] });
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 text-xs h-7"
                                  onClick={() => base44.entities.ScopeOfWork.update(s.id, { status: 'rejected', customer_notes: 'Rejected by customer' }).then(() => queryClient.invalidateQueries({ queryKey: ['customer-scopes', userEmail] }))}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                          {s.status !== 'closed' && s.status !== 'rejected' && (
                            <div className="p-3 bg-slate-50 border-t border-slate-200">
                              <Button size="sm" variant="outline" className="w-full text-xs h-7 border-green-300 text-green-700 hover:bg-green-50" onClick={() => setCloseoutScope(s)}>
                                <LogOut className="w-3 h-3 mr-1" /> Close Out Job
                              </Button>
                            </div>
                          )}
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

            {/* Customer Profile Summary - show if has profile */}
             {customerProfile && (
              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Profile Summary</h3>
                <CustomerProfileDisplay profile={customerProfile} jobCount={postedJobs?.length || 0} />
                <CustomerBadges completedJobsCount={customerProfile?.completed_jobs_count || 0} />
              </div>
             )}

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
                     This will permanently delete all records associated with <strong>{userEmail}</strong>, including signed disclaimers and payment records. This cannot be undone.
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
          </div>
          </div>
          );
          }