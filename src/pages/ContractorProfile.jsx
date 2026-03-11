import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Mail, 
  CheckCircle2, DollarSign, ShieldAlert, AlertCircle, FileText, CalendarCheck,
  GraduationCap, Award, Briefcase, MessageSquareQuote
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisclaimerModal from '@/components/disclaimer/DisclaimerModal';
import ScopeOfWorkForm from '@/components/scopeofwork/ScopeOfWorkForm';
import PaymentGate from '@/components/payment/PaymentGate';
import InAppMessageForm from '@/components/messaging/InAppMessageForm';
import ContractorServices from '@/components/contractor/ContractorServices';
import AvailabilityCalendar from '@/components/contractor/AvailabilityCalendar';
import ReviewsSection from '@/components/contractor/ReviewsSection';
import ReviewsDisplayDetailed from '@/components/reviews/ReviewsDisplayDetailed';
import PortfolioDisplay from '@/components/contractor/PortfolioDisplay';
import EquipmentDisplay from '@/components/contractor/EquipmentDisplay';
import QuoteRequestForm from '@/components/quote/QuoteRequestForm';
import QuoteFeeDisclosure from '@/components/quote/QuoteFeeDisclosure';
import ContractorBadges, { getHighestBadge } from '@/components/badges/ContractorBadges';
import TestimonyForm from '@/components/reviews/TestimonyForm';

const tradeLabels = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  carpenter: 'Carpenter',
  hvac: 'HVAC Technician',
  mason: 'Mason',
  roofer: 'Roofer',
  painter: 'Painter',
  welder: 'Welder',
  tiler: 'Tiler',
  landscaper: 'Landscaper',
  other: 'Other Trade'
};

export default function ContractorProfile() {
   const urlParams = new URLSearchParams(window.location.search);
   const contractorId = urlParams.get('id');
   const [userAuth, setUserAuth] = useState(null);
   const [authLoading, setAuthLoading] = useState(true);
   const [showDisclaimer, setShowDisclaimer] = useState(false);
   const [showQuoteForm, setShowQuoteForm] = useState(false);
   const [showQuoteFeeDisclosure, setShowQuoteFeeDisclosure] = useState(false);
   const [showTestimonyForm, setShowTestimonyForm] = useState(false);

   // Check user authentication or admin preview mode
   useEffect(() => {
     const isAdminPreview = urlParams.get('admin') === 'true';
     if (isAdminPreview) {
       setUserAuth({ id: 'admin-preview', full_name: 'Admin' });
       setAuthLoading(false);
     } else {
       base44.auth.me()
         .then(user => setUserAuth(user))
         .catch(() => setUserAuth(null))
         .finally(() => setAuthLoading(false));
     }
   }, []);
  const [disclaimerSigned, setDisclaimerSigned] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [showScopeForm, setShowScopeForm] = useState(false);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [customerPaid, setCustomerPaid] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);

  // Re-fetch payment record to get latest status (e.g. work_scheduled)
  const { data: latestPayment } = useQuery({
    queryKey: ['payment-status', paymentRecord?.id],
    queryFn: () => base44.entities.Payment.filter({ id: paymentRecord.id }),
    enabled: !!paymentRecord?.id,
    select: (data) => data[0],
    refetchInterval: showMessageForm ? 10000 : false,
  });

  const activePayment = latestPayment || paymentRecord;
  const isWorkScheduled = activePayment?.status === 'work_scheduled';

  const { data: contractor, isLoading } = useQuery({
    queryKey: ['contractor', contractorId],
    queryFn: async () => {
      const list = await base44.entities.Contractor.filter({ id: contractorId });
      return list[0];
    },
    enabled: !!contractorId,
  });

  const { data: services } = useQuery({
    queryKey: ['contractor-services', contractorId],
    queryFn: () => base44.entities.ServiceOffering.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const { data: availability } = useQuery({
    queryKey: ['contractor-availability', contractorId],
    queryFn: () => base44.entities.AvailabilitySlot.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['contractor-reviews', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId, verified: true }),
    enabled: !!contractorId,
  });

  // Check if the logged-in customer has a closed scope with this contractor
  const { data: closedScopes } = useQuery({
    queryKey: ['closed-scopes', contractorId, userAuth?.email],
    queryFn: () => base44.entities.ScopeOfWork.filter({
      contractor_id: contractorId,
      customer_email: userAuth.email,
      status: 'closed',
    }),
    enabled: !!contractorId && !!userAuth?.email,
  });

  const hasWorkedWithContractor = closedScopes && closedScopes.length > 0;

  if (isLoading || authLoading) {
     return (
       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
       </div>
     );
   }

   const isAdminPreview = urlParams.get('admin') === 'true';

   if (!userAuth && !isAdminPreview) {
     return (
       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <Card className="max-w-md w-full p-8 text-center">
           <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
           <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h1>
           <p className="text-slate-600 mb-6">You must be logged in to contact contractors.</p>
           <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 w-full">
             Log In
           </Button>
         </Card>
       </div>
     );
   }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Contractor Not Found</h1>
            <p className="text-sm text-slate-600">This contractor's profile is no longer available. They may have deleted their account or the profile ID may be incorrect.</p>
          </div>
          <div className="space-y-2 pt-2">
            <Link to={createPageUrl('FindContractors')} className="block">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
                Browse All Contractors
              </Button>
            </Link>
            <a href="mailto:support@surfcoast.com" className="block">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Contractors')} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Contractors
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Profile Card */}
        <Card className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100">
                {contractor.photo_url ? (
                  <img src={contractor.photo_url} alt={contractor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white text-4xl font-bold">
                    {contractor.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{contractor.name}</h1>
                    {contractor.available && (
                      <Badge className="bg-green-100 text-green-700">Available</Badge>
                    )}
                    {contractor.identity_verified ? (
                      <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ID Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unverified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge 
                      variant="secondary" 
                      className={contractor.contractor_type === 'trade_specific' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-amber-100 text-amber-700'
                      }
                    >
                      {contractor.contractor_type === 'trade_specific' 
                        ? tradeLabels[contractor.trade_specialty] || 'Trade Specialist'
                        : 'General Contractor'
                      }
                    </Badge>
                    {/* Highest badge compact display */}
                    {contractor.unique_customers_count > 0 && (() => {
                      const highest = getHighestBadge(contractor.unique_customers_count);
                      return highest ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${highest.border} ${highest.bg} ${highest.text}`}>
                          {highest.emoji} {highest.name}
                        </span>
                      ) : null;
                    })()}
                  </div>

                  {contractor.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${star <= contractor.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{contractor.rating}</span>
                      {contractor.reviews_count && (
                        <span className="text-slate-500">({contractor.reviews_count} reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                {contractor.hourly_rate && (
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Hourly Rate</div>
                    <div className="text-3xl font-bold text-slate-900">${contractor.hourly_rate}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {contractor.location}
                </div>
                {contractor.years_experience && (
                 <div className="flex items-center gap-1.5">
                   <Clock className="w-4 h-4 text-slate-400" />
                   {contractor.years_experience} years experience
                 </div>
                )}
                {contractor.completed_jobs_count > 0 && (
                 <div className="flex items-center gap-1.5">
                   <Briefcase className="w-4 h-4 text-slate-400" />
                   {contractor.completed_jobs_count} jobs completed
                 </div>
                )}
                {contractor.unique_customers_count > 0 && (
                 <div className="flex items-center gap-1.5">
                   <CheckCircle2 className="w-4 h-4 text-slate-400" />
                   {contractor.unique_customers_count} unique customers
                 </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
             {contractor.bio && (
               <Card className="p-6">
                 <h2 className="text-lg font-semibold text-slate-900 mb-4">About Me</h2>
                 <p className="text-slate-600 whitespace-pre-wrap">{contractor.bio}</p>
               </Card>
             )}

             {/* Skills */}
             {contractor.skills?.length > 0 && (
               <Card className="p-6">
                 <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills & Types of Work</h2>
                 <div className="flex flex-wrap gap-2">
                   {contractor.skills.map((skill, idx) => (
                     <span key={idx} className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">
                       {skill}
                     </span>
                   ))}
                 </div>
               </Card>
             )}

            {/* Certifications */}
            {contractor.certifications?.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Certifications & Licenses</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {contractor.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-slate-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Credentials */}
            {contractor.credential_documents?.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Credentials & Licenses</h2>
                <div className="space-y-3">
                  {contractor.credential_documents.map((cred, idx) => {
                    const iconMap = { degree: GraduationCap, diploma: GraduationCap, contractor_license: Briefcase, trade_license: Briefcase };
                    const Icon = iconMap[cred.type] || Award;
                    const typeLabels = { certificate: 'Certificate', degree: 'Academic Degree', diploma: 'Diploma', contractor_license: "Contractor's License", trade_license: 'Trade License', other: 'Credential' };
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-green-700" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{cred.label}</div>
                            <div className="text-xs text-slate-500">{typeLabels[cred.type] || 'Credential'}</div>
                            {cred.sole_proprietor_confirmed && (
                              <div className="text-xs text-green-600">✓ Sole proprietor registered</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 ml-2 italic">Verified on file</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Services */}
            <ContractorServices services={services} />

            {/* Availability */}
            <AvailabilityCalendar slots={availability} />

            {/* Reviews & Testimonies */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div />
                {hasWorkedWithContractor ? (
                  <Button
                    onClick={() => setShowTestimonyForm(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                    size="sm"
                  >
                    <MessageSquareQuote className="w-4 h-4 mr-2" />
                    Leave a Testimony
                  </Button>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Only customers who have completed a job with this contractor can leave a review.
                  </p>
                )}
              </div>
              <ReviewsDisplayDetailed 
                revieweeId={contractorId} 
                revieweeName={contractor?.name}
                revieweeType="contractor"
              />
            </div>

            {/* Badges */}
             <ContractorBadges completedJobsCount={contractor.completed_jobs_count || 0} uniqueCustomersCount={contractor.unique_customers_count || 0} />

            {/* Portfolio Projects */}
             <PortfolioDisplay contractorId={contractorId} isOwner={false} />

            {/* Equipment & Tools */}
            <EquipmentDisplay contractorId={contractorId} isOwner={false} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Options</h2>

              <Tabs defaultValue="message" className="space-y-4">
                <TabsList className="w-full">
                  <TabsTrigger value="quote" className="flex-1">Quick Quote</TabsTrigger>
                  <TabsTrigger value="message" className="flex-1">Message</TabsTrigger>
                </TabsList>

                <TabsContent value="quote" className="space-y-3">
                  {isAdminPreview ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                      <p className="text-xs text-amber-700"><strong>Admin Preview Mode</strong><br/>Quote features disabled</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>$1.75 per quote</strong> — Get a written estimate without back-and-forth conversation
                        </p>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowQuoteFeeDisclosure(true)}
                      >
                        Request Quick Quote
                      </Button>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="message">
                  <div className="space-y-3">
                    {isAdminPreview ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center space-y-2">
                        <p className="text-xs font-semibold text-amber-800">Admin Preview Mode</p>
                        <p className="text-xs text-amber-700">Messaging features are disabled during admin preview. Sign in as a customer to test messaging.</p>
                      </div>
                    ) : disclaimerSigned && customerPaid ? (
                      <div className="space-y-3">
                      {isWorkScheduled ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CalendarCheck className="w-4 h-4 text-green-600 shrink-0" />
                          <p className="text-xs text-green-700 font-medium">Work Scheduled — session closed</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                          <p className="text-xs text-green-700">
                            Disclaimer signed by <strong>{signerName}</strong> · Fee paid · Messaging unlocked
                          </p>
                        </div>
                      )}
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                        onClick={() => setShowMessageForm(true)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {isWorkScheduled ? 'View Past Messages' : 'Open Messages'}
                      </Button>
                      {!isWorkScheduled && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowScopeForm(true)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Request Scope of Work
                        </Button>
                      )}
                      {isWorkScheduled && (
                        <p className="text-xs text-slate-400 text-center">
                          To message again, pay a new $1.50 access fee.
                        </p>
                      )}
                    </div>
                  ) : disclaimerSigned && !customerPaid ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                        <p className="text-xs text-green-700">Disclaimer signed by <strong>{signerName}</strong></p>
                      </div>
                      <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-500 text-center">
                        🔒 Contact details hidden until fee is paid
                      </div>
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                        onClick={() => setShowPaymentGate(true)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pay $1.50 to Unlock Messaging
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-500 text-center">
                        🔒 Contact details hidden — sign disclaimer & pay fee to message
                      </div>
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                        onClick={() => setShowDisclaimer(true)}
                      >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Sign Disclaimer & Contact
                      </Button>
                      </div>
                      )}
                      </div>
                      </TabsContent>
              </Tabs>
            </Card>

            {/* Admin Preview Banner */}
             {isAdminPreview && (
               <Card className="p-5 bg-blue-50 border-blue-200">
                 <div className="flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                     <h4 className="font-semibold text-blue-800 mb-1">Admin Preview Mode</h4>
                     <p className="text-xs text-blue-700 leading-relaxed">
                       You are viewing this profile as an admin. Payment & messaging features are disabled. Sign in as a customer to test all features.
                     </p>
                   </div>
                 </div>
               </Card>
             )}

             {/* Identity Verification Status */}
             {!contractor.identity_verified && (
               <Card className="p-5 bg-orange-50 border-orange-200">
                 <div className="flex items-start gap-3">
                   <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                   <div>
                     <h4 className="font-semibold text-orange-800 mb-1">Identity Not Yet Verified</h4>
                     <p className="text-xs text-orange-700 leading-relaxed">
                       This contractor's identity documents have not yet been reviewed by SurfCoast. 
                       Exercise caution and conduct your own due diligence before engaging.
                     </p>
                   </div>
                 </div>
               </Card>
             )}

            {/* Disclaimer Notice */}
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Required Notice</h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Before contacting this contractor, you must acknowledge that damages after work begins are your responsibility. 
                    You are required to vet all contractors independently before accepting any work.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="font-medium">{contractor.contractor_type === 'general' ? 'General' : 'Trade Specific'}</span>
                </div>
                {contractor.trade_specialty && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialty</span>
                    <span className="font-medium">{tradeLabels[contractor.trade_specialty]}</span>
                  </div>
                )}
                {contractor.years_experience && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-medium">{contractor.years_experience} years</span>
                  </div>
                )}
                {contractor.completed_jobs_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jobs Completed</span>
                    <span className="font-medium">{contractor.completed_jobs_count}</span>
                  </div>
                )}
                {contractor.unique_customers_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unique Customers</span>
                    <span className="font-medium">{contractor.unique_customers_count}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Availability</span>
                  <span className={`font-medium ${contractor.available ? 'text-green-600' : 'text-slate-500'}`}>
                    {contractor.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ScopeOfWorkForm
        open={showScopeForm}
        onClose={() => setShowScopeForm(false)}
        contractor={contractor}
        paymentRecord={paymentRecord}
      />

      <PaymentGate
        open={showPaymentGate}
        onClose={() => setShowPaymentGate(false)}
        onPaid={(record) => { setCustomerPaid(true); setPaymentRecord(record); setShowPaymentGate(false); }}
        payerType="customer"
        contractorId={contractor?.id}
        contractorEmail={contractor?.email}
        contractorName={contractor?.name}
      />

      <InAppMessageForm
        open={showMessageForm}
        onClose={() => setShowMessageForm(false)}
        paymentRecord={activePayment}
        senderType="customer"
        recipientId={contractor?.id}
        recipientName={contractor?.name}
        recipientEmail={contractor?.email}
      />

      <DisclaimerModal
        open={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccepted={(record) => {
          setDisclaimerSigned(true);
          setSignerName(record.customer_name);
          setShowDisclaimer(false);
        }}
      />

      <QuoteFeeDisclosure
        open={showQuoteFeeDisclosure}
        onClose={() => setShowQuoteFeeDisclosure(false)}
        onConfirm={() => {
          setShowQuoteFeeDisclosure(false);
          setShowQuoteForm(true);
        }}
        contractorName={contractor?.name}
      />

      <QuoteRequestForm
        open={showQuoteForm}
        onClose={() => setShowQuoteForm(false)}
        contractor={contractor}
        customer={userAuth}
      />

      <TestimonyForm
        open={showTestimonyForm}
        onClose={() => setShowTestimonyForm(false)}
        contractorId={contractorId}
        contractorName={contractor?.name}
        user={userAuth}
      />
    </div>
  );
}