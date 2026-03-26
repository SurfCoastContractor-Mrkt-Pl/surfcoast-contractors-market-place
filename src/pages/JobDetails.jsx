import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  ArrowLeft, MapPin, Calendar, DollarSign, Clock, 
  User, AlertCircle, ShieldAlert, MessageSquare, Camera, Eye
} from 'lucide-react';
import QuoteSubmitForm from '@/components/jobs/QuoteSubmitForm';
import DisclaimerModal from '@/components/disclaimer/DisclaimerModal';
import PaymentGate from '@/components/payment/PaymentGate';
import InAppMessageForm from '@/components/messaging/InAppMessageForm';
import CustomerScopeEditor from '@/components/customer/CustomerScopeEditor';
import ContractorProposalForm from '@/components/contractor/ContractorProposalForm';
import ScopeComparison from '@/components/contractor/ScopeComparison';

const urgencyColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

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
  other: 'Other'
};

export default function JobDetails() {
   const urlParams = new URLSearchParams(window.location.search);
   const jobId = urlParams.get('id');
   const [userAuth, setUserAuth] = useState(null);
   const [authLoading, setAuthLoading] = useState(true);
   const [showDisclaimer, setShowDisclaimer] = useState(false);

   // Check user authentication
   useEffect(() => {
     base44.auth.me()
       .then(user => setUserAuth(user))
       .catch(() => setUserAuth(null))
       .finally(() => setAuthLoading(false));
   }, []);
  const [disclaimerSigned, setDisclaimerSigned] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [contractorPaid, setContractorPaid] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [isCustomer, setIsCustomer] = useState(null);

  const [contractor, setContractor] = useState(null); // job poster's contractor profile (for warnings)
  const [myContractor, setMyContractor] = useState(null); // logged-in contractor profile (for quote form)

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const list = await base44.entities.Job.filter({ id: jobId });
      return list[0];
    },
    enabled: !!jobId,
  });

  useEffect(() => {
    const fetchContractor = async () => {
      if (job?.poster_email) {
        const contractors = await base44.entities.Contractor.filter({ email: job.poster_email });
        if (contractors && contractors.length > 0) {
          setContractor(contractors[0]);
        }
      }
    };
    fetchContractor();
  }, [job?.poster_email]);

  const { data: customerScope } = useQuery({
    queryKey: ['customer-scope-request', jobId],
    queryFn: () => base44.entities.CustomerScopeRequest.filter({ job_id: jobId }),
    enabled: !!jobId,
    select: (data) => data?.[0],
  });

  const { data: contractorProposals } = useQuery({
    queryKey: ['contractor-proposals', jobId],
    queryFn: () => base44.entities.ContractorScopeProposal.filter({ job_id: jobId }),
    enabled: !!jobId,
  });

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const contractors = await base44.entities.Contractor.filter({ email: user.email });
          const isContractor = contractors && contractors.length > 0;
          setIsCustomer(!isContractor);
          if (isContractor) setMyContractor(contractors[0]);
        }
      } catch {
        setIsCustomer(null);
      }
    };
    checkUserType();
  }, []);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!userAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h1>
          <p className="text-slate-600 mb-6">You must be logged in to apply for jobs.</p>
          <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 w-full">
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Job Not Found</h1>
          <Link to={createPageUrl('Jobs')}>
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatBudget = () => {
    if (!job.budget_min && !job.budget_max) return 'Negotiable';
    if (job.budget_min && job.budget_max) {
      return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
    }
    if (job.budget_max) return `Up to $${job.budget_max.toLocaleString()}`;
    return `From $${job.budget_min.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
         {contractor?.account_locked && (
           <div style={{ background: '#fee2e2', border: '1px solid #f87171', borderRadius: '10px', padding: '12px 20px', color: '#991b1b', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <AlertCircle className="w-5 h-5" />
             ⚠️ This contractor's account has been suspended. Please contact support.
           </div>
         )}
         {contractor && !contractor.stripe_account_charges_enabled && (
           <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '10px', padding: '12px 20px', color: '#92400e', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <AlertCircle className="w-5 h-5" />
             ⚠️ This contractor cannot currently receive payments via Stripe. Payments may be delayed.
           </div>
         )}
         <div className="grid lg:grid-cols-3 gap-8">
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-6">
             <Card className="p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                  <p className="text-slate-500">Posted by {job.poster_name}</p>
                </div>
                <Badge className={urgencyColors[job.urgency]} size="lg">
                  {job.urgency === 'urgent' ? '🔥 Urgent' : job.urgency}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-slate-300">
                  {job.contractor_type_needed === 'trade_specific' 
                    ? tradeLabels[job.trade_needed] || 'Trade Specific'
                    : job.contractor_type_needed === 'general' 
                      ? 'General Contractor'
                      : 'Any Contractor'
                  }
                </Badge>
                {job.status === 'open' && (
                  <Badge className="bg-green-100 text-green-700">Open</Badge>
                )}
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Job Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
              </div>
            </Card>

            {/* Customer Scope Request */}
            {isCustomer && (
              <CustomerScopeEditor 
                job={job}
                userEmail={userAuth?.email}
                userName={userAuth?.full_name}
              />
            )}

            {/* Before Photos */}
            {job.before_photo_urls?.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Before Photos</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{job.before_photo_urls.length} photos</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Taken by the customer to document pre-work area conditions.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {job.before_photo_urls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-slate-100 block hover:opacity-90 transition-opacity">
                      <img src={url} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* Contractor sees scope after paying */}
            {!isCustomer && contractorPaid && customerScope && (
              <Card className="p-6 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Customer's Scope Request</h3>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap mb-4">{customerScope.scope_details}</p>
                {customerScope.scope_photo_urls?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Photos:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {customerScope.scope_photo_urls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden bg-slate-200 hover:opacity-90 transition">
                          <img src={url} alt={`Scope ${idx + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Details Grid */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Location</div>
                    <div className="font-medium text-slate-900">{job.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Budget ({job.budget_type || 'negotiable'})</div>
                    <div className="font-medium text-slate-900">{formatBudget()}</div>
                  </div>
                </div>

                {job.start_date && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Start Date</div>
                      <div className="font-medium text-slate-900">
                        {format(new Date(job.start_date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                )}

                {job.duration && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Duration</div>
                      <div className="font-medium text-slate-900">{job.duration}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Apply for this Job</h3>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Posted by</div>
                  <div className="font-medium text-slate-900">{job.poster_name}</div>
                </div>
              </div>

              {/* Contact details always hidden */}
              <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-500 text-center mb-4">
                🔒 Client contact details are hidden — messaging is only available after disclaimer + fee
              </div>

              {disclaimerSigned && contractorPaid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">
                      Verified · Full access unlocked
                    </p>
                  </div>
                  {!isCustomer && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => document.getElementById('proposal-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Submit Proposal
                    </Button>
                  )}
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                    onClick={() => setShowMessageForm(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send In-App Message
                  </Button>
                </div>
              ) : disclaimerSigned && !contractorPaid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">Disclaimer signed by <strong>{signerName}</strong></p>
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
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                  onClick={() => setShowDisclaimer(true)}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Sign Disclaimer & Apply
                </Button>
              )}
            </Card>

            {/* Disclaimer Notice */}
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Important Notice</h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    You must read and sign the customer liability disclaimer before contacting a contractor. 
                    All damages after work commences are the customer's responsibility. 
                    It is your duty to vet all contractors prior to accepting any work.
                  </p>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Tips for Contractors</h4>
                  <p className="text-sm text-blue-700">
                    Include your relevant experience, certifications, and estimated timeline when reaching out.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          </div>
          </div>

          {/* Quote Submit Form — visible to contractors after paying */}
          {!isCustomer && disclaimerSigned && contractorPaid && myContractor && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <QuoteSubmitForm job={job} contractor={myContractor} />
          </div>
          )}

          {/* Contractor Proposal Form */}
          {!isCustomer && disclaimerSigned && contractorPaid && customerScope && (
          <div id="proposal-form" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContractorProposalForm
            scopeRequest={customerScope}
            contractorId={userAuth?.id}
            contractorName={userAuth?.full_name}
            contractorEmail={userAuth?.email}
          />
          </div>
          )}

          {/* Proposals Display */}
          {contractorProposals && contractorProposals.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Contractor Proposals ({contractorProposals.length})
            </h3>
            <div className="space-y-4">
              {contractorProposals.map(proposal => (
                <div key={proposal.id} className="border border-slate-200 rounded-lg p-4">
                  <ScopeComparison
                    customerScopeRequest={customerScope}
                    contractorProposal={proposal}
                  />
                </div>
              ))}
            </div>
          </Card>
          </div>
          )}

          <DisclaimerModal
            open={showDisclaimer}
            onClose={() => setShowDisclaimer(false)}
            onAccepted={(record) => {
              setDisclaimerSigned(true);
              setSignerName(record.customer_name);
              setShowDisclaimer(false);
            }}
          />

          <PaymentGate
            open={showPaymentGate}
            onClose={() => setShowPaymentGate(false)}
            onPaid={(record) => { setContractorPaid(true); setPaymentRecord(record); setShowPaymentGate(false); }}
            payerType="contractor"
            contractorId=""
            contractorEmail={job?.poster_email}
            contractorName={job?.poster_name}
          />

          <InAppMessageForm
            open={showMessageForm}
            onClose={() => setShowMessageForm(false)}
            paymentRecord={paymentRecord}
            senderType="contractor"
            recipientId={job?.id}
            recipientName={job?.poster_name}
            recipientEmail={job?.poster_email}
            subject={`Interest in: ${job?.title}`}
          />
          </div>
          );
          }