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
import CustomerQuotesTab from '@/components/customer/CustomerQuotesTab';
import AuthTopBar from '@/components/auth/AuthTopBar';
import TrialBadge from '@/components/customer/TrialBadge';
import ConsumerModeToggle from '@/components/consumer/ConsumerModeToggle';
import PersistentChatSidebar from '@/components/chat/PersistentChatSidebar';

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
   const [activeSidebarChat, setActiveSidebarChat] = useState(null);

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

  const { data: proposals } = useQuery({
    queryKey: ['customer-proposals', userEmail],
    queryFn: () => base44.entities.ContractorScopeProposal.filter({ customer_email: userEmail }),
    enabled: !!userEmail,
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
    <>
    <div className="customer-profile" style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", overflowX:"hidden", background:"#0a1628" }}>
    <div style={{ position:"fixed", inset:0, backgroundImage:`url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png)`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", zIndex:0 }} />
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(to bottom, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.45) 35%, rgba(10,22,40,0.80) 100%)", zIndex:1 }} />

    <div className="relative py-12 text-white overflow-hidden" style={{position:"relative", zIndex:10, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", justifyContent:"space-between" }}>
        <Link to={createPageUrl('Home')} style={{ display:'flex', flexDirection:'column', gap:'2px', textDecoration: 'none' }}>
          <span style={{ fontSize:'clamp(14px, 4vw, 17px)', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1, textAlign:'left' }}>SurfCoast</span>
          <span style={{ fontSize:'clamp(7px, 2vw, 10px)', fontWeight:'700', letterSpacing:'1.5px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1, textAlign:'left', marginLeft:'8px' }}>MARKETPLACE</span>
        </Link>
        <div style={{ marginLeft:"auto" }}>
          <AuthTopBar />
        </div>
      </div>
      <div className="absolute inset-0" style={{backgroundColor: 'transparent'}}></div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{position:"relative", zIndex:2}}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #c97ab4 0%, #d97706 100%)', boxShadow: '0 8px 24px rgba(201, 122, 180, 0.4)'}}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-white">Your Account</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-white/60 text-base font-light">Manage projects, quotes & activity</p>
                {customerProfile && <TrialBadge profile={customerProfile} />}
              </div>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" style={{position:"relative", zIndex:2, background:"transparent", minHeight:"100vh"}}>
         {/* Admin Preview Banner */}
         {isAdminPreview && (
           <Card className="p-5 bg-blue-50 border-blue-200/60 rounded-2xl">
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

         {/* Consumer Mode Toggle */}
         <div className="bg-white/92 backdrop-blur-md border border-white/20 rounded-2xl p-4">
           <ConsumerModeToggle />
         </div>

         {/* Tabs - always visible */}
         <Tabs defaultValue="profile">
               <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                 <TabsList className="flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-10 h-auto p-1 gap-0.5">
                   <TabsTrigger value="profile" className="text-xs px-2.5 py-1.5 whitespace-nowrap">Profile</TabsTrigger>
                   <TabsTrigger value="quotes" className="text-xs px-2.5 py-1.5 whitespace-nowrap flex items-center gap-1">
                     Quotes
                     {proposals?.filter(p => p.status === 'pending_customer_review').length > 0 && (
                       <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                         {proposals.filter(p => p.status === 'pending_customer_review').length}
                       </span>
                     )}
                   </TabsTrigger>
                   <TabsTrigger value="post-job" className="text-xs px-2.5 py-1.5 whitespace-nowrap flex items-center gap-1">
                     <Plus className="w-3 h-3" />Post
                   </TabsTrigger>
                   <TabsTrigger value="my-jobs" className="text-xs px-2.5 py-1.5 whitespace-nowrap flex items-center gap-1">
                     My Jobs
                     {postedJobs?.length > 0 && (
                       <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                         {postedJobs.length}
                       </span>
                     )}
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
                <div className="space-y-7">
                  <CustomerProfileEditor
                    profile={customerProfile}
                    userEmail={userEmail}
                    onAskAgent={() => setAgentOpen(true)}
                  />
                  {customerProfile && (
                    <div className="space-y-7">
                      <div className="pb-4 border-b border-slate-300">
                        <h3 className="text-2xl font-bold text-slate-900">Your Profile</h3>
                      </div>
                      <CustomerProfileDisplay profile={customerProfile} jobCount={postedJobs?.length || 0} />
                      <CustomerBadges completedJobsCount={customerProfile?.completed_jobs_count || 0} />
                      </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="quotes">
                 <CustomerQuotesTab customerEmail={userEmail} />
               </TabsContent>

              <TabsContent value="my-jobs">
                <Card className="p-8 border border-white/20 bg-white/92 backdrop-blur-md rounded-2xl">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 pb-4 border-b border-slate-300">Job Postings</h2>
                  <p className="text-sm text-slate-500 mb-6">View, edit, or delete your posted jobs. Expand any job to see details and manage it.</p>
                  <CustomerJobsManager userEmail={userEmail} />
                </Card>
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
                <Card className="p-8 border border-white/20 bg-white/92 backdrop-blur-md rounded-2xl">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-300">Payment History</h2>
                  {payments?.filter(p => p.status !== 'work_scheduled').length > 0 ? (
                     <div className="space-y-3">
                       {payments.filter(p => p.status !== 'work_scheduled').map(p => (
                         <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl gap-3">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             {p.status === 'confirmed' ? (
                               <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                             ) : (
                               <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                             )}
                             <div className="min-w-0">
                               <div className="text-sm font-medium text-slate-900">${p.amount?.toFixed(2)} — {p.purpose}</div>
                               <div className="text-xs text-slate-600">{new Date(p.created_date).toLocaleDateString()}</div>
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
                <div className="space-y-6">
                  {/* Payment Methods — hidden in admin preview to prevent auth conflicts */}
                  {userEmail && !isAdminPreview && <SavedPaymentMethods userEmail={userEmail} />}

                  {/* Privacy & Security Info */}
                  <SecurityInfoPanel />

                  {/* Account Security */}
                  <Card className="p-8 border border-slate-200/40">
                    <div className="flex items-start gap-3 mb-4">
                      <Lock className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-serif font-bold text-slate-900 text-lg">Account Security</h3>
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
                  <Card className="p-8 border border-slate-200/40">
                    <div className="flex items-start gap-3 mb-4">
                      <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-serif font-bold text-slate-900 text-lg">Contact Email</h3>
                        <p className="text-sm text-slate-500">{userEmail}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">All notifications and account communications are sent to this email address. To change it, you'll need to contact support.</p>
                    <Button variant="outline" disabled className="w-full opacity-50">
                      Update Email (Coming Soon)
                    </Button>
                  </Card>


                </div>
              </TabsContent>

              <TabsContent value="scopes">
                <Card className="p-8 border border-white/20 bg-white/92 backdrop-blur-md rounded-2xl">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-300">Project Agreements</h2>

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
                       <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                         {hasProgressPayments && s.status === 'approved' && (
                           <div className="p-3 border-b border-slate-200">
                             <ProjectProgressBar payments={scopePhases} />
                           </div>
                         )}
                         <div className="flex items-center justify-between p-3 bg-white gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-900 truncate">{s.job_title}</div>
                                <div className="text-xs text-slate-700">Contractor: {s.contractor_name} — {s.cost_type === 'fixed' ? `$${s.cost_amount} fixed` : s.cost_type === 'quote' ? `Quote: $${s.cost_amount}` : `$${s.cost_amount}/hr`}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                             {s.status === 'approved' && (
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="text-xs h-7 px-2.5 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                 onClick={() => setActiveSidebarChat(s)}
                                 title="Open persistent chat sidebar"
                               >
                                 💬 Sidebar Chat
                               </Button>
                             )}
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

        {/* Persistent Chat Sidebar */}
        {activeSidebarChat && (
          <PersistentChatSidebar
            scopeId={activeSidebarChat.id}
            scopeTitle={activeSidebarChat.job_title}
            userEmail={userEmail}
            userName={customerProfile?.full_name}
            userType="customer"
            onClose={() => setActiveSidebarChat(null)}
          />
          )}
          </> 
          );
          }