import React, { useState, useEffect } from 'react';
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
import { User, CheckCircle2, Clock, FileText, CalendarCheck, LogOut, Settings, Lock, Mail, Plus, Bell, AlertCircle } from 'lucide-react';
import SecurityInfoPanel from '@/components/security/SecurityInfoPanel';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import JobCloseout from '@/components/scopeofwork/JobCloseout.jsx';
import CustomerProfileDisplay from '@/components/customer/CustomerProfileDisplay';
import CustomerWelcomeModal from '@/components/customer/CustomerWelcomeModal';
import CustomerProfileEditor from '@/components/customer/CustomerProfileEditor';
import FloatingAgentWidget from '@/components/agent/FloatingAgentWidget';
import SavedPaymentMethods from '@/components/payment/SavedPaymentMethods';
import ActiveSessions from '@/components/payment/ActiveSessions';
import CustomerBadges from '@/components/badges/CustomerBadges';
import JobHistory from '@/components/customer/JobHistory';
import ContactAdminPanel from '@/components/support/ContactAdminPanel';
import DeleteAccountSection from '@/components/support/DeleteAccountSection';
import QuickJobPostForm from '@/components/customer/QuickJobPostForm';
import ScopeChatPanel from '@/components/scopeofwork/ScopeChatPanel';
import ProjectProgressBar from '@/components/progresspayments/ProjectProgressBar';
import QuoteComparisonDashboard from '@/components/quote/QuoteComparisonDashboard';
import ReferralDashboard from '@/components/referral/ReferralDashboard';
import CustomerJobsManager from '@/components/customer/CustomerJobsManager';

export default function CustomerAccount() {
   const urlParams = new URLSearchParams(window.location.search);
   const adminPreviewEmail = urlParams.get('email');
   const isAdminPreview = urlParams.get('admin') === 'true';

   const [closeoutScope, setCloseoutScope] = useState(null);
   const queryClient = useQueryClient();
   const [loading, setLoading] = useState(true);
   const [userEmail, setUserEmail] = useState(null);
   const [showWelcome, setShowWelcome] = useState(false);
   const [agentOpen, setAgentOpen] = useState(false);

   useEffect(() => {
     const checkAuth = async () => {
       try {
         if (isAdminPreview && adminPreviewEmail) {
           setUserEmail(adminPreviewEmail);
           setLoading(false);
           return;
         }
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

  const { data: progressPayments } = useQuery({
    queryKey: ['customer-progress-payments', userEmail],
    queryFn: () => base44.entities.ProgressPayment.filter({ customer_email: userEmail }),
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
      <div className="relative py-12 text-white overflow-hidden" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(0,0,0,0.60)'}}></div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: '#1E5A96'}}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Customer Account</h1>
              <p className="text-white/70">Manage your activity and data</p>
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
        onOpen={() => setAgentOpen(true)}
      />

      <JobCloseout scope={closeoutScope} role="customer" open={!!closeoutScope} onClose={() => { setCloseoutScope(null); queryClient.invalidateQueries({ queryKey: ['customer-scopes', userEmail] }); }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
         {/* Admin Preview Banner */}
         {isAdminPreview && (
           <Card className="p-5 bg-blue-50 border-blue-200">
             <div className="flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-semibold text-blue-800 mb-1">Admin Preview Mode</h4>
                 <p className="text-xs text-blue-700">
                   You are viewing this customer's account setup as an admin. Edit, delete, and logout features are disabled in preview mode.
                 </p>
               </div>
             </div>
           </Card>
         )}

         {/* Auth Button */}
         <div className="flex gap-3">
           <Button
             variant="outline"
             onClick={() => base44.auth.logout()}
             disabled={isAdminPreview}
           >
             <LogOut className="w-4 h-4 mr-2" />
             {isAdminPreview ? 'Logout (Disabled in Preview)' : 'Logout'}
           </Button>
         </div>

         {/* Tabs - always visible */}
         <Tabs defaultValue="profile">
               <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                 <TabsList className="flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-9 h-auto p-1 gap-0.5">
                   <TabsTrigger value="profile" className="text-xs px-2.5 py-1.5 whitespace-nowrap">Profile</TabsTrigger>
                   <TabsTrigger value="quotes" className="text-xs px-2.5 py-1.5 whitespace-nowrap">Quotes</TabsTrigger>
                   <TabsTrigger value="post-job" className="text-xs px-2.5 py-1.5 whitespace-nowrap flex items-center gap-1">
                     <Plus className="w-3 h-3" />Job
                   </TabsTrigger>
                   <TabsTrigger value="history" className="text-xs px-2.5 py-1.5 whitespace-nowrap">History</TabsTrigger>
                   <TabsTrigger value="badges" className="text-xs px-2.5 py-1.5 whitespace-nowrap">Badges</TabsTrigger>
                   <TabsTrigger value="referrals" className="text-xs px-2.5 py-1.5 whitespace-nowrap">Referrals</TabsTrigger>
                   <TabsTrigger value="scopes" className="text-xs px-2.5 py-1.5 whitespace-nowrap flex items-center gap-1">
                     Scopes
                     {scopes?.filter(s => s.status === 'pending_approval').length > 0 && (
                       <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                         {scopes.filter(s => s.status === 'pending_approval').length}
                       </span>
                     )}
                   </TabsTrigger>
                   <TabsTrigger value="payments" className="text-xs px-2.5 py-1.5 whitespace-nowrap">Payments</TabsTrigger>
                   <TabsTrigger value="settings" className="text-xs px-2.5 py-1.5 whitespace-nowrap"><Settings className="w-3.5 h-3.5" /></TabsTrigger>
                 </TabsList>
               </div>

              <TabsContent value="profile">
                <div className="space-y-6">
                  <CustomerProfileEditor
                    profile={customerProfile}
                    userEmail={userEmail}
                    onAskAgent={() => setAgentOpen(true)}
                  />
                  {customerProfile && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-900">Profile Summary</h3>
                      <CustomerProfileDisplay profile={customerProfile} jobCount={postedJobs?.length || 0} />
                      <CustomerBadges completedJobsCount={customerProfile?.completed_jobs_count || 0} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="quotes">
                <QuoteComparisonDashboard customerEmail={userEmail} />
              </TabsContent>

              <TabsContent value="history">
                <JobHistory userEmail={userEmail} />
              </TabsContent>

              <TabsContent value="badges" className="min-h-96 w-full">
                <CustomerBadges completedJobsCount={customerProfile?.completed_jobs_count ?? 0} />
              </TabsContent>

              <TabsContent value="referrals">
                <ReferralDashboard userEmail={userEmail} />
              </TabsContent>

              <TabsContent value="post-job" className="w-full min-h-screen p-6">
                {isLoading ? (
                  <Card className="p-6 text-center text-slate-500">
                    <p>Loading form...</p>
                  </Card>
                ) : (
                  <QuickJobPostForm userEmail={userEmail} userName={customerProfile?.full_name || 'Customer'} />
                )}
              </TabsContent>

              <TabsContent value="payments">
                <ActiveSessions payments={payments} />
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
                                className="text-xs h-7 px-2 gap-1"
                                onClick={async () => {
                                  const res = await base44.functions.invoke('generatePaymentInvoice', { paymentId: p.id });
                                  const blob = new Blob([res.data], { type: 'application/pdf' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `Invoice-${p.id.substring(0,8).toUpperCase()}.pdf`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                📄 Download Invoice
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
                  {/* Payment Methods — hidden in admin preview to prevent auth conflicts */}
                  {userEmail && !isAdminPreview && <SavedPaymentMethods userEmail={userEmail} />}

                  {/* Privacy & Security Info */}
                  <SecurityInfoPanel />

                  {/* Account Security */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Lock className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Account Security</h3>
                        <p className="text-sm text-slate-500">Your login credentials are managed by SurfCoast's secure authentication system.</p>
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

                  {/* Pending progress payments notice */}
                  {progressPayments?.filter(pp => pp.status === 'contractor_completed').length > 0 && (
                    <div className="flex items-start gap-3 p-3 mb-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <Bell className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800">
                          {progressPayments.filter(pp => pp.status === 'contractor_completed').length} phase(s) awaiting your approval
                        </p>
                        <p className="text-xs text-orange-700 mt-0.5">A contractor has completed work and is waiting for your review and payment release.</p>
                      </div>
                    </div>
                  )}

                  {scopes?.length > 0 ? (
                    <div className="space-y-3">
                      {scopes.map(s => {
                       const scopePhases = (progressPayments || []).filter(pp => pp.scope_id === s.id);
                       const hasProgressPayments = scopePhases.length > 0;
                       return (
                       <React.Fragment key={s.id}>
                       <div className="border border-slate-200 rounded-xl overflow-hidden">
                         {hasProgressPayments && s.status === 'approved' && (
                           <div className="p-3 border-b border-slate-200">
                             <ProjectProgressBar payments={scopePhases} />
                           </div>
                         )}
                         <div className="flex items-center justify-between p-3 bg-slate-50 gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800 truncate">{s.job_title}</div>
                                <div className="text-xs text-slate-500">Contractor: {s.contractor_name} — {s.cost_type === 'fixed' ? `$${s.cost_amount} fixed` : s.cost_type === 'quote' ? `Quote: $${s.cost_amount}` : `$${s.cost_amount}/hr`}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                             <ScopeChatPanel
                               scope={s}
                               userEmail={userEmail}
                               userName={customerProfile?.full_name || userEmail}
                               userType="customer"
                             />
                             <Badge className={
                               s.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                               s.status === 'approved' ? 'bg-green-100 text-green-700' :
                               s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                               'bg-amber-100 text-amber-700'
                             }>
                               {s.status === 'pending_approval' ? 'Pending' : s.status}
                             </Badge>
                            </div>
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
                            </React.Fragment>
                            );})}

                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No scope of work agreements found.</p>
                  )}
                </Card>
              </TabsContent>


            </Tabs>



            {/* Contact Admin */}
            <ContactAdminPanel userEmail={userEmail} userName={customerProfile?.full_name} />

            {/* Delete Profile */}
            <DeleteAccountSection userEmail={userEmail} onDelete={handleDeleteAll} />
          </div>
          </div>
          );
          }