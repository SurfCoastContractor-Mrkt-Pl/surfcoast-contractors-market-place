import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardHat, CheckCircle2, Clock, CalendarCheck, FileText, LogOut, Settings, Lock, Mail, Edit2, X, Download, AlertTriangle, AlertCircle, Bell, MessageCircle, InboxIcon } from 'lucide-react';
import QuoteReplyDialog from '@/components/quote/QuoteReplyDialog';
import { useNavigate } from 'react-router-dom';
import SecurityInfoPanel from '@/components/security/SecurityInfoPanel';
import { Textarea } from '@/components/ui/textarea';
import AccountLockedBanner from '@/components/contractor/AccountLockedBanner';
import JobCloseout from '@/components/scopeofwork/JobCloseout.jsx';
import PortfolioDisplay from '@/components/contractor/PortfolioDisplay';
import EquipmentDisplay from '@/components/contractor/EquipmentDisplay';
import ContractorProfileEditor from '@/components/contractor/ContractorProfileEditor';
import SavedPaymentMethods from '@/components/payment/SavedPaymentMethods';
import ContractorBadges from '@/components/badges/ContractorBadges';
import ContactAdminPanel from '@/components/support/ContactAdminPanel';
import ScopeChatPanel from '@/components/scopeofwork/ScopeChatPanel';
import ProjectProgressBar from '@/components/progresspayments/ProjectProgressBar';
import DeleteAccountSection from '@/components/support/DeleteAccountSection';
import StripePayoutSetup from '@/components/contractor/StripePayoutSetup';
import IdentityVerification from '@/components/contractor/IdentityVerification';
import MinorHoursTracker from '@/components/contractor/MinorHoursTracker';
import MinorComplianceChecklist from '@/components/contractor/MinorComplianceChecklist';
import CredentialDocumentsManager from '@/components/contractor/CredentialDocumentsManager';
import ContractorAnalyticsDashboard from '@/components/contractor/ContractorAnalyticsDashboard';
import AvailabilityStatusManager from '@/components/contractor/AvailabilityStatusManager';
import FeaturedBadgeToggle from '@/components/contractor/FeaturedBadgeToggle';
import ContractorJobDashboard from '@/components/contractor/ContractorJobDashboard';
import RealTimeAvailabilityManager from '@/components/contractor/RealTimeAvailabilityManager';
import FeaturedListingManager from '@/components/featured/FeaturedListingManager';
import ReferralDashboard from '@/components/referral/ReferralDashboard';
import ServicePackageManager from '@/components/contractor/ServicePackageManager';
import LiveSessions from '@/components/contractor/LiveSessions';
import TrialStatusBanner from '@/components/contractor/TrialStatusBanner';
import ProfileCompletionWidget from '@/components/contractor/ProfileCompletionWidget';
import LicensedProfessionalDocuments from '@/components/contractor/LicensedProfessionalDocuments';
import DocumentVisibilityManager from '@/components/contractor/DocumentVisibilityManager';
import ContractorQuotesTab from '@/components/contractor/ContractorQuotesTab';
import AuthTopBar from '@/components/auth/AuthTopBar';
import ConsumerModeToggle from '@/components/consumer/ConsumerModeToggle';
import PersistentChatSidebar from '@/components/chat/PersistentChatSidebar';
import LeadManagementDashboard from '@/components/contractor/LeadManagementDashboard';
import ReviewManagementPanel from '@/components/contractor/ReviewManagementPanel';
import ProjectMilestoneManager from '@/components/projects/ProjectMilestoneManager';
import EarningsReportsDashboard from '@/components/contractor/EarningsReportsDashboard';
import ChatArchiveDashboard from '@/components/contractor/ChatArchiveDashboard';
import LicenseVerificationDashboard from '@/components/contractor/LicenseVerificationDashboard';
import MarketingToolkit from '@/components/contractor/MarketingToolkit';
import PayoutManagementDashboard from '@/components/contractor/PayoutManagementDashboard';
import AdvancedAnalyticsDashboard from '@/components/contractor/AdvancedAnalyticsDashboard';
import AvailabilityScheduleManager from '@/components/contractor/AvailabilityScheduleManager';
import PortfolioGalleryManager from '@/components/contractor/PortfolioGalleryManager';
import ServicePackagesManager from '@/components/contractor/ServicePackagesManager';
import CustomerTestimonialsManager from '@/components/contractor/CustomerTestimonialsManager';
import DocumentManagementHub from '@/components/contractor/DocumentManagementHub';
import CaseStudiesBuilder from '@/components/contractor/CaseStudiesBuilder';
import ClientRelationshipManager from '@/components/contractor/ClientRelationshipManager';
import ProposalTemplateManager from '@/components/contractor/ProposalTemplateManager';

export default function ContractorAccount() {
   const urlParams = new URLSearchParams(window.location.search);
   const adminPreviewId = urlParams.get('id');
   const isAdminPreview = urlParams.get('admin') === 'true';

   const navigate = useNavigate();
   const [closeoutScope, setCloseoutScope] = useState(null);
   const [selectedQuote, setSelectedQuote] = useState(null);
   const queryClient = useQueryClient();
   const [loading, setLoading] = useState(true);
   const [userEmail, setUserEmail] = useState(null);
   const [editingBio, setEditingBio] = useState(false);
   const [bioText, setBioText] = useState('');
   const [downloadedInvoices, setDownloadedInvoices] = useState(() => {
     try { return JSON.parse(localStorage.getItem('downloadedInvoices') || '[]'); } catch { return []; }
   });
   const [downloadingId, setDownloadingId] = useState(null);
   const [activeSidebarChat, setActiveSidebarChat] = useState(null);

   useEffect(() => {
     const checkAuth = async () => {
       try {
         if (isAdminPreview && adminPreviewId) {
           setUserEmail(adminPreviewId);
           setLoading(false);
           return;
         }
         const user = await base44.auth.me();
         if (!user) {
           base44.auth.redirectToLogin();
           return;
         }
         setUserEmail(user.email);
       } catch (error) {
         base44.auth.redirectToLogin();
       } finally {
         setLoading(false);
       }
     };
     checkAuth();
   }, []);

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['my-contractor', userEmail],
    queryFn: () => base44.entities.Contractor.filter({ email: userEmail }),
    enabled: !!userEmail,
  });

  const contractor = contractors?.[0];

  const { data: payments } = useQuery({
    queryKey: ['contractor-payments', userEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: userEmail, payer_type: 'contractor' }),
    enabled: !!userEmail,
  });

  const { data: lockedScope } = useQuery({
    queryKey: ['locked-scope', contractor?.locked_scope_id],
    queryFn: async () => {
      const results = await base44.entities.ScopeOfWork.filter({ id: contractor.locked_scope_id });
      return results[0];
    },
    enabled: !!contractor?.locked_scope_id && !!contractor?.account_locked,
  });

  const { data: contractorScopes } = useQuery({
    queryKey: ['contractor-scopes', contractor?.id],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_id: contractor?.id }),
    enabled: !!contractor?.id,
  });

  const { data: pastWorkPayments } = useQuery({
    queryKey: ['contractor-past-work', contractor?.id],
    queryFn: () => base44.entities.Payment.filter({ contractor_id: contractor?.id, status: 'work_scheduled' }),
    enabled: !!contractor?.id,
  });

  const { data: progressPayments } = useQuery({
    queryKey: ['contractor-progress-payments', userEmail],
    queryFn: () => base44.entities.ProgressPayment.filter({ contractor_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: incomingQuotes } = useQuery({
    queryKey: ['contractor-quotes', userEmail],
    queryFn: () => base44.entities.QuoteRequest.filter({ contractor_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: liveSessions } = useQuery({
    queryKey: ['contractor-live-sessions-count', userEmail],
    queryFn: () => base44.entities.TimedChatSession.filter({ contractor_email: userEmail, status: 'active' }),
    enabled: !!userEmail,
    refetchInterval: 15000,
  });

  const { data: contractorServices, refetch: refetchServices } = useQuery({
    queryKey: ['contractor-services', contractor?.id],
    queryFn: () => base44.entities.ServiceOffering.filter({ contractor_id: contractor?.id }),
    enabled: !!contractor?.id,
  });

  const updateBioMutation = useMutation({
    mutationFn: async (bioData) => {
      return base44.entities.Contractor.update(contractor.id, bioData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor', userEmail] });
      setEditingBio(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (email) => {
      await base44.functions.invoke('deleteAccountCascading', {
        accountType: 'contractor',
        accountEmail: email,
      });
    },
    onSuccess: () => {
      base44.auth.logout();
    },
  });

  const handleDownloadInvoice = async (paymentId) => {
    setDownloadingId(paymentId);
    const res = await base44.functions.invoke('generatePaymentInvoice', { paymentId });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${paymentId.substring(0, 8).toUpperCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    const updated = [...new Set([...downloadedInvoices, paymentId])];
    setDownloadedInvoices(updated);
    localStorage.setItem('downloadedInvoices', JSON.stringify(updated));
    setDownloadingId(null);
  };

  // A contractor can take a new scope only if they've downloaded invoices for all confirmed payments
  const confirmedPayments = payments?.filter(p => p.status === 'confirmed') || [];
  const allInvoicesDownloaded = confirmedPayments.length === 0 || confirmedPayments.every(p => downloadedInvoices.includes(p.id));

  const handleBioEdit = () => {
    setBioText(contractor?.bio || '');
    setEditingBio(true);
  };

  const handleBioSave = () => {
    updateBioMutation.mutate({ bio: bioText });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
            <HardHat className="w-6 h-6 text-slate-900 animate-spin" />
          </div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <div className="relative py-12 text-white overflow-hidden" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <AuthTopBar />
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(0,0,0,0.60)'}}></div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: '#1E5A96'}}>
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Contractor Account</h1>
              <p className="text-white/70">Manage your contractor profile</p>
            </div>
          </div>
        </div>
      </div>

      <JobCloseout scope={closeoutScope} role="contractor" open={!!closeoutScope} onClose={() => { setCloseoutScope(null); queryClient.invalidateQueries({ queryKey: ['contractor-scopes', contractor?.id] }); }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
         {/* Trial Status Banner */}
         {contractor && !isAdminPreview && (
           <TrialStatusBanner contractor={contractor} />
         )}

         {/* Admin Preview Banner */}
         {isAdminPreview && (
           <Card className="p-5 bg-blue-50 border-blue-200">
             <div className="flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-semibold text-blue-800 mb-1">Admin Preview Mode</h4>
                 <p className="text-xs text-blue-700">
                   You are viewing this contractor's account setup as an admin. Edit, delete, and logout features are disabled in preview mode.
                 </p>
               </div>
             </div>
           </Card>
         )}

         {/* Consumer Mode Toggle */}
         <div className="bg-white rounded-lg p-4 border border-slate-200">
           <ConsumerModeToggle />
         </div>



         {contractor && (
          <>
            {/* Locked Account Banner */}
            {contractor.account_locked && (
              <AccountLockedBanner contractor={contractor} lockedScope={lockedScope} />
            )}

            <Tabs defaultValue="profile">
             <TabsList className="w-full grid-cols-22 overflow-x-auto">
                 <TabsTrigger value="dashboard" className="text-xs sm:text-sm whitespace-nowrap">Dashboard</TabsTrigger>
                 <TabsTrigger value="leads" className="text-xs sm:text-sm whitespace-nowrap">Leads</TabsTrigger>
                 <TabsTrigger value="reviews" className="text-xs sm:text-sm whitespace-nowrap">Reviews</TabsTrigger>
                 <TabsTrigger value="earnings" className="text-xs sm:text-sm whitespace-nowrap">Earnings</TabsTrigger>
                 <TabsTrigger value="chats" className="text-xs sm:text-sm whitespace-nowrap">Chats</TabsTrigger>
                 <TabsTrigger value="analytics" className="text-xs sm:text-sm whitespace-nowrap">Analytics</TabsTrigger>
                 <TabsTrigger value="payouts" className="text-xs sm:text-sm whitespace-nowrap">Payouts</TabsTrigger>
                 <TabsTrigger value="availability" className="text-xs sm:text-sm whitespace-nowrap">Availability</TabsTrigger>
                 <TabsTrigger value="portfolio" className="text-xs sm:text-sm whitespace-nowrap">Portfolio</TabsTrigger>
                 <TabsTrigger value="packages" className="text-xs sm:text-sm whitespace-nowrap">Packages</TabsTrigger>
                 <TabsTrigger value="testimonials" className="text-xs sm:text-sm whitespace-nowrap">Testimonials</TabsTrigger>
                 <TabsTrigger value="documents" className="text-xs sm:text-sm whitespace-nowrap">Documents</TabsTrigger>
                 <TabsTrigger value="case-studies" className="text-xs sm:text-sm whitespace-nowrap">Case Studies</TabsTrigger>
                 <TabsTrigger value="crm" className="text-xs sm:text-sm whitespace-nowrap">CRM</TabsTrigger>
                 <TabsTrigger value="proposals" className="text-xs sm:text-sm whitespace-nowrap">Proposals</TabsTrigger>
                 <TabsTrigger value="license" className="text-xs sm:text-sm whitespace-nowrap">License</TabsTrigger>
                 <TabsTrigger value="marketing" className="text-xs sm:text-sm whitespace-nowrap">Marketing</TabsTrigger>
                 <TabsTrigger value="live-sessions" className="text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                   Live
                   {liveSessions?.length > 0 && (
                     <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{liveSessions.length}</span>
                   )}
                 </TabsTrigger>
                 <TabsTrigger value="quotes" className="text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                   Quotes
                   {incomingQuotes?.filter(q => q.status === 'pending' || q.status === 'sent').length > 0 && (
                     <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{incomingQuotes.filter(q => q.status === 'pending' || q.status === 'sent').length}</span>
                   )}
                 </TabsTrigger>
                 <TabsTrigger value="profile" className="text-xs sm:text-sm whitespace-nowrap">Profile</TabsTrigger>
                 <TabsTrigger value="badges" className="text-xs sm:text-sm whitespace-nowrap">Badges</TabsTrigger>
                 <TabsTrigger value="featured" className="text-xs sm:text-sm whitespace-nowrap">Featured</TabsTrigger>
                 <TabsTrigger value="referrals" className="text-xs sm:text-sm whitespace-nowrap">Referrals</TabsTrigger>
                 <TabsTrigger value="fees" className="text-xs sm:text-sm whitespace-nowrap">Fees</TabsTrigger>
                 <TabsTrigger value="scopes" className="text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap">
                   <FileText className="w-3 h-3 sm:w-4 sm:h-4" />Scopes
                   {contractorScopes?.filter(s => s.status !== 'closed').length > 0 && (
                     <span className="ml-0.5 bg-amber-100 text-amber-700 text-xs rounded-full px-1">{contractorScopes.filter(s => s.status !== 'closed').length}</span>
                   )}
                 </TabsTrigger>
                 <TabsTrigger value="settings" className="text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"><Settings className="w-3 h-3 sm:w-4 sm:h-4" />Settings</TabsTrigger>
                 <TabsTrigger value="past-work" className="text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap">
                   <CalendarCheck className="w-3 h-3 sm:w-4 sm:h-4" />Work
                   {pastWorkPayments?.length > 0 && (
                     <span className="ml-0.5 bg-green-100 text-green-700 text-xs rounded-full px-1">{pastWorkPayments.length}</span>
                   )}
                 </TabsTrigger>
               </TabsList>

              <TabsContent value="dashboard">
                 <div className="space-y-4">
                   <RealTimeAvailabilityManager contractor={contractor} />
                   <ContractorJobDashboard contractorId={contractor?.id} contractorEmail={userEmail} />
                   <ContractorAnalyticsDashboard contractor={contractor} />
                   <FeaturedBadgeToggle contractor={contractor} />
                 </div>
               </TabsContent>

               <TabsContent value="leads">
                 <LeadManagementDashboard contractorEmail={userEmail} />
               </TabsContent>

               <TabsContent value="reviews">
                 <ReviewManagementPanel contractorId={contractor?.id} contractorEmail={userEmail} />
               </TabsContent>

               <TabsContent value="earnings">
                 <EarningsReportsDashboard contractorEmail={userEmail} contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="chats">
                 <ChatArchiveDashboard contractorEmail={userEmail} />
               </TabsContent>

               <TabsContent value="license">
                 <LicenseVerificationDashboard contractor={contractor} />
               </TabsContent>

               <TabsContent value="marketing">
                 <MarketingToolkit contractor={contractor} />
               </TabsContent>

               <TabsContent value="analytics">
                 <AdvancedAnalyticsDashboard contractorEmail={userEmail} contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="payouts">
                 <PayoutManagementDashboard contractor={contractor} />
               </TabsContent>

               <TabsContent value="availability">
                 <AvailabilityScheduleManager contractor={contractor} contractorEmail={userEmail} />
               </TabsContent>

               <TabsContent value="portfolio">
                 <PortfolioGalleryManager contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="packages">
                 <ServicePackagesManager contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="testimonials">
                 <CustomerTestimonialsManager contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="documents">
                 <DocumentManagementHub contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="case-studies">
                 <CaseStudiesBuilder contractorId={contractor?.id} />
               </TabsContent>

               <TabsContent value="live-sessions">
                 <LiveSessions contractorEmail={userEmail} />
               </TabsContent>

               <TabsContent value="quotes">
                 <ContractorQuotesTab contractorId={contractor?.id} />
               </TabsContent>

              <TabsContent value="profile">
                 <div className="flex gap-6 items-start">
                 <div className="flex-1 min-w-0 space-y-4">
                    {/* Profile Summary */}
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Profile</h2>
                      <div className="flex items-center gap-4">
                        {contractor.photo_url ? (
                          <img src={contractor.photo_url} alt={contractor.name} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                            {contractor.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{contractor.name}</div>
                          <div className="text-slate-500 text-sm">{contractor.email}</div>
                          <div className="text-slate-500 text-sm">{contractor.location}</div>
                          <Badge className={contractor.available ? 'bg-green-100 text-green-700 mt-1' : 'bg-slate-100 text-slate-500 mt-1'}>
                            {contractor.available ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    {/* Minor Hours Tracker */}
                    {contractor?.is_minor && <MinorHoursTracker contractor={contractor} />}

                   {/* Minor Compliance Checklist */}
                   {contractor?.is_minor && <MinorComplianceChecklist contractor={contractor} />}

                   {/* Identity Verification */}
                   <IdentityVerification contractor={contractor} onVerified={() => queryClient.invalidateQueries({ queryKey: ['my-contractor', userEmail] })} />

                   {/* Profile Information Editor */}
                   <ContractorProfileEditor contractor={contractor} />

                   {/* Credentials & Certifications */}
                   <LicensedProfessionalDocuments contractor={contractor} />
                   <CredentialDocumentsManager
                     credentials={contractor?.credential_documents || []}
                     onChange={(creds) => base44.entities.Contractor.update(contractor.id, { credential_documents: creds })}
                     legalName={contractor?.name}
                   />

                   {/* About Me Section */}
                   <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">About Me</h2>
                      {!editingBio && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={handleBioEdit}
                           disabled={isAdminPreview}
                           className="gap-1.5"
                         >
                           <Edit2 className="w-4 h-4" />
                           Edit
                         </Button>
                       )}
                    </div>

                    {editingBio ? (
                      <div className="space-y-3">
                        <Textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell potential customers about yourself, your experience, expertise, and what makes you stand out..."
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-slate-500">
                          This section helps customers understand your background and decide if you're the right fit for their project.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleBioSave}
                            className="text-white"
                            style={{backgroundColor: '#1E5A96'}}
                            disabled={updateBioMutation.isPending}
                          >
                            {updateBioMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingBio(false)}
                            disabled={updateBioMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {contractor?.bio ? (
                          <p className="text-slate-600 whitespace-pre-wrap">{contractor.bio}</p>
                        ) : (
                          <p className="text-slate-400 italic">No bio added yet. Tell customers about yourself to help them choose you for their projects.</p>
                        )}
                      </div>
                    )}
                  </Card>

                  <ServicePackageManager contractorId={contractor?.id} services={contractorServices || []} onRefresh={refetchServices} />

                  <PortfolioDisplay contractorId={contractor?.id} isOwner={true} />
                  <EquipmentDisplay contractorId={contractor?.id} isOwner={true} />
                  </div>
                  {/* Completion Widget */}
                  <div className="hidden lg:block w-64 shrink-0">
                  <ProfileCompletionWidget contractor={contractor} />
                  </div>
                  </div>
                  </TabsContent>

              <TabsContent value="scopes">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Scope of Work Agreements</h2>
                  {!allInvoicesDownloaded && (
                    <div className="flex items-start gap-3 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Invoice Download Required</p>
                        <p className="text-xs text-red-700 mt-0.5">You must download your invoices from the <strong>Fees</strong> tab before submitting or closing out new scopes of work.</p>
                      </div>
                    </div>
                  )}
                  {contractorScopes?.length > 0 ? (
                    <div className="space-y-3">
                      {contractorScopes.map(s => {
                        const scopePhases = (progressPayments || []).filter(pp => pp.scope_id === s.id);
                        const hasProgressPayments = scopePhases.length > 0;
                        return (
                        <React.Fragment key={s.id}>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          {hasProgressPayments && s.status === 'approved' && (
                            <div className="p-3 border-b border-slate-100 bg-white">
                              <ProjectProgressBar payments={scopePhases} />
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 bg-slate-50 gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{s.job_title}</div>
                              <div className="text-xs text-slate-500">Customer: {s.customer_name} — {s.cost_type === 'fixed' ? `$${s.cost_amount} fixed` : `$${s.cost_amount}/hr`}</div>
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
                              userName={contractor?.name || userEmail}
                              userType="contractor"
                            />
                            <Badge className={
                              s.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                              s.status === 'approved' ? 'bg-green-100 text-green-700' :
                              s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {s.status === 'pending_approval' ? 'Pending' : s.status}
                            </Badge>
                            {s.status !== 'closed' && s.status !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-2 border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-40"
                                onClick={() => setCloseoutScope(s)}
                                disabled={!allInvoicesDownloaded}
                                title={!allInvoicesDownloaded ? 'Download your invoices first (Fees tab)' : undefined}
                              >
                                <LogOut className="w-3 h-3 mr-1" /> Close Out
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* Milestones */}
                        {s.status === 'approved' && (
                          <div className="border-t border-slate-100 p-4 bg-white">
                            <h4 className="font-medium text-slate-900 mb-4">Project Milestones</h4>
                            <ProjectMilestoneManager scopeId={s.id} scopeStatus={s.status} />
                          </div>
                        )}
                        </div>
                        </React.Fragment>
                        );})}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No scope of work agreements yet.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="badges" className="min-h-96 w-full">
                <ContractorBadges completedJobsCount={contractor?.completed_jobs_count || 0} uniqueCustomersCount={contractor?.unique_customers_count || 0} />
              </TabsContent>

              <TabsContent value="featured">
                <FeaturedListingManager contractorEmail={userEmail} contractorId={contractor?.id} />
              </TabsContent>

              <TabsContent value="referrals">
                <ReferralDashboard userEmail={userEmail} />
              </TabsContent>

              <TabsContent value="fees">
                <div className="space-y-4">
                  {/* Stripe Payout Setup */}
                  <StripePayoutSetup contractor={contractor} onSetupComplete={() => {}} />

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">Platform Fee Status</h2>
                    <p className="text-xs text-slate-500 mb-4">Download an invoice for each confirmed payment to stay eligible for new scopes of work.</p>

                  {/* Checklist summary */}
                  <div className={`flex items-center gap-3 p-3 mb-4 rounded-xl border ${allInvoicesDownloaded ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    {allInvoicesDownloaded ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${allInvoicesDownloaded ? 'text-green-800' : 'text-amber-800'}`}>
                        {allInvoicesDownloaded
                          ? 'All invoices downloaded — you\'re clear to take new scopes'
                          : `${confirmedPayments.filter(p => !downloadedInvoices.includes(p.id)).length} invoice(s) still need to be downloaded`}
                      </p>
                      {!allInvoicesDownloaded && (
                        <p className="text-xs text-amber-700 mt-0.5">Download the invoices below to unlock the Close Out button on your scopes.</p>
                      )}
                    </div>
                  </div>
                  {payments?.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {p.status === 'confirmed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800">${p.amount.toFixed(2)} — {p.purpose}</div>
                              <div className="text-xs text-slate-500">{new Date(p.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant={downloadedInvoices.includes(p.id) ? 'ghost' : 'outline'}
                                className={`text-xs h-7 px-2 gap-1 ${downloadedInvoices.includes(p.id) ? 'text-green-600' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}`}
                                onClick={() => handleDownloadInvoice(p.id)}
                                disabled={downloadingId === p.id}
                              >
                                <Download className="w-3 h-3" />
                                {downloadingId === p.id ? 'Downloading...' : downloadedInvoices.includes(p.id) ? 'Downloaded ✓' : 'Download Invoice'}
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
                    <p className="text-sm text-slate-500">No platform fee payments found.</p>
                    )}
                    </Card>
                    </div>
                    </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-4">
                  {/* Document Visibility */}
                  <DocumentVisibilityManager contractor={contractor} />

                  {/* Payment Methods */}
                  {userEmail && <SavedPaymentMethods userEmail={userEmail} />}

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
                        <p className="text-sm text-slate-500">{contractor?.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">All notifications and communications are sent to this email address. To change it, you'll need to contact support.</p>
                    <Button variant="outline" disabled className="w-full opacity-50">
                      Update Email (Coming Soon)
                    </Button>
                  </Card>


                </div>
              </TabsContent>

              <TabsContent value="past-work">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Past Work</h2>
                  <p className="text-xs text-slate-500 mb-4">Jobs that were marked as "Work Scheduled" — completed engagements.</p>
                  {pastWorkPayments?.length > 0 ? (
                    <div className="space-y-3">
                      {pastWorkPayments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CalendarCheck className="w-5 h-5 text-green-600 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-slate-800">{p.purpose || 'Job engagement'}</div>
                              <div className="text-xs text-slate-500">Customer: {p.payer_name} · {p.payer_email}</div>
                              <div className="text-xs text-slate-400">{new Date(p.updated_date || p.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Completed</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No completed work yet.</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            {/* Contact Admin */}
            <ContactAdminPanel userEmail={userEmail} userName={contractor?.name} />

            {/* Delete Profile */}
            <DeleteAccountSection userEmail={contractor.email} displayName={contractor.name} onDelete={() => deleteMutation.mutate(contractor.email)} />
          </>
          )}
          {!contractor && (
          <Card className="p-6 text-center text-slate-500">
            <p>No contractor profile found. Please contact support if you believe this is an error.</p>
          </Card>
          )}
          </div>
          </div>

          {/* Persistent Chat Sidebar */}
          {activeSidebarChat && (
          <PersistentChatSidebar
            scopeId={activeSidebarChat.id}
            scopeTitle={activeSidebarChat.job_title}
            userEmail={userEmail}
            userName={contractor?.name}
            userType="contractor"
            onClose={() => setActiveSidebarChat(null)}
          />
          )}
          </>
          );
          }