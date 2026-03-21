import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  MapPin,
  Briefcase,
  Shield,
  Clock,
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  Calendar,
  Award,
} from 'lucide-react';
import { getTradeIcon, getTradeColor } from '@/lib/tradeIcons';

import PortfolioDisplay from '@/components/contractor/PortfolioDisplay';
import ReviewsSection from '@/components/contractor/ReviewsSection';
import ContractorAvailabilityCalendar from '@/components/calendar/ContractorAvailabilityCalendar';
import MessagingPricingTable from '@/components/messaging/MessagingPricingTable';
import ContractorServices from '@/components/contractor/ContractorServices';
import ChatWindow from '@/components/messaging/ChatWindow';
import PublicCredentialsDisplay from '@/components/contractor/PublicCredentialsDisplay';
import AuthTopBar from '@/components/auth/AuthTopBar';
import AuthGateModal from '@/components/auth/AuthGateModal';

export default function ContractorProfile() {
  const [searchParams] = useSearchParams();
  const contractorId = searchParams.get('id');
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagingPricingOpen, setMessagingPricingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPaymentId, setChatPaymentId] = useState(null);
  const [chatUserEmail, setChatUserEmail] = useState(null);
  const [chatUserName, setChatUserName] = useState(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState('continue');
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false));
  }, []);

  const requireAuth = (action, onAuthed) => {
    if (isAuthenticated) {
      onAuthed();
    } else {
      setAuthGateAction(action);
      setAuthGateOpen(true);
    }
  };

  useEffect(() => {
    const fetchContractor = async () => {
      try {
        if (!contractorId) {
          // No ID provided — load first available contractor as a preview
          const data = await base44.entities.Contractor.filter({ available: true }, '-rating', 1);
          if (data && data.length > 0) {
            setContractor(data[0]);
          } else {
            // Fallback: try any contractor
            const all = await base44.entities.Contractor.list('-created_date', 1);
            if (all && all.length > 0) setContractor(all[0]);
          }
          setLoading(false);
          return;
        }
        const data = await base44.entities.Contractor.filter({ id: contractorId });
        if (data && data.length > 0) {
          setContractor(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch contractor:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContractor();
  }, [contractorId]);

  // Auto-open chat if redirected here after successful timed payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paid = urlParams.get('paid');
    const pId = urlParams.get('payment_id');
    if (paid === 'timed' && pId) {
      setChatPaymentId(pId);
      // Load current user for chat
      base44.auth.me().then(user => {
        if (user) {
          setChatUserEmail(user.email);
          setChatUserName(user.full_name);
        }
        setChatOpen(true);
      }).catch(() => {
        // Even if not logged in, open the chat — ChatWindow handles anon too
        setChatOpen(true);
      });
    }
  }, []);

  const { data: reviews } = useQuery({
    queryKey: ['contractor-reviews', contractorId],
    queryFn: () =>
      base44.entities.Review.filter({ contractor_id: contractorId, verified: true }, '-created_date', 10),
    enabled: !!contractorId,
  });

  const { data: services } = useQuery({
    queryKey: ['contractor-services', contractorId],
    queryFn: () => base44.entities.ServiceOffering.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const { data: completedJobs } = useQuery({
    queryKey: ['contractor-jobs', contractorId],
    queryFn: () =>
      base44.entities.ScopeOfWork.filter(
        { contractor_id: contractorId, status: 'closed' },
        '-closed_date',
        6
      ),
    enabled: !!contractorId,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <p className="text-slate-600">Contractor not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="contractor-profile" style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", overflowX:"hidden", background:"#0a1628" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:`url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png)`, backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(to bottom, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.45) 35%, rgba(10,22,40,0.80) 100%)", zIndex:1 }} />

      {/* Header */}
       <div className="relative text-white overflow-hidden" style={{position:"relative", zIndex:10, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
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
         <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{position:"relative", zIndex:2}}>
           <Link to={createPageUrl('FindContractors')}>
             <Button variant="ghost" className="mb-5 text-white/80 hover:text-white hover:bg-white/10">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back to Search
             </Button>
           </Link>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-6 mb-8">
                 {contractor.photo_url ? (
                   <img
                     src={contractor.photo_url}
                     alt={contractor.name}
                     className="w-32 h-32 rounded-3xl object-cover border-2 border-white/40 shadow-2xl"
                   />
                 ) : (
                   <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white text-5xl font-bold border-2 border-white/40 shadow-2xl" style={{backgroundColor: '#1E5A96'}}>
                     {contractor.name?.[0]}
                   </div>
                 )}
                 <div className="flex-1">
                    <h1 className="text-5xl font-serif font-bold text-white leading-tight">{contractor.name}</h1>
                    {contractor.contractor_type === 'trade_specific' && contractor.trade_specialty && (
                      <p className="text-white/60 text-sm font-medium tracking-wide uppercase mt-2">{contractor.trade_specialty.replace(/_/g, ' ')}</p>
                    )}
                    {contractor.line_of_work && (
                      <p className="text-white/60 text-sm font-medium tracking-wide uppercase mt-1">{contractor.line_of_work.replace(/_/g, ' ')}</p>
                    )}
                    {contractor.years_experience && <p className="text-white/70 mt-3 text-base font-light">{contractor.years_experience}+ years of professional experience</p>}
                   <div className="flex items-center gap-2 mt-2 flex-wrap">
                     {contractor.identity_verified && (
                       <div className="flex items-center gap-2 text-green-400">
                         <Shield className="w-4 h-4" />
                         <span className="text-sm font-semibold">Identity Verified</span>
                       </div>
                     )}
                     {contractor.is_licensed_sole_proprietor && contractor.license_verified && contractor.license_status === 'active' && (
                       <div className="flex items-center gap-2 text-green-400">
                         <CheckCircle2 className="w-4 h-4" />
                         <span className="text-sm font-semibold">License Verified</span>
                       </div>
                     )}
                     {contractor.is_licensed_sole_proprietor && (contractor.license_status === 'inactive' || contractor.license_status === 'expired') && (
                       <div className="flex items-center gap-2 text-orange-300">
                         <Clock className="w-4 h-4" />
                         <span className="text-sm font-semibold">Inactive License</span>
                       </div>
                     )}
                     {contractor.is_licensed_sole_proprietor && contractor.license_status === 'pending_review' && (
                       <div className="flex items-center gap-2 text-yellow-300">
                         <Clock className="w-4 h-4" />
                         <span className="text-sm font-semibold">License Pending</span>
                       </div>
                     )}
                   </div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {contractor.rating && (
                  <Badge className="bg-white/15 text-white border-white/20">
                    <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                    {contractor.rating.toFixed(1)} ({contractor.reviews_count} reviews)
                  </Badge>
                )}
                {contractor.completed_jobs_count > 0 && (
                  <Badge className="bg-white/15 text-white border-white/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {contractor.completed_jobs_count} Jobs Completed
                  </Badge>
                )}
                <Badge className="bg-white/15 text-white border-white/20">
                  <MapPin className="w-3 h-3 mr-1" />
                  {contractor.location}
                </Badge>
              </div>
            </div>

            {/* CTA */}
             <div className="bg-white/98 p-8 rounded-3xl h-fit shadow-2xl backdrop-blur-sm border border-white/60" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,245,250,0.95) 100%)'}}>
               <div className="mb-6 pb-6 border-b" style={{borderColor: 'rgba(200,120,180,0.2)'}}>
                 {contractor.rate_type === 'fixed' ? (
                   <>
                     <p style={{color: '#c97ab4', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Fixed Rate</p>
                     <p className="text-4xl font-bold" style={{color: '#0a1628'}}>
                       {contractor.fixed_rate ? `$${contractor.fixed_rate}` : 'Request Quote'}
                       <span style={{color: '#6b7280', fontSize: '1rem', marginLeft: '0.5rem', fontWeight: '400'}}>{contractor.fixed_rate ? ' fixed' : ''}</span>
                     </p>
                    {contractor.fixed_rate_details && (
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{contractor.fixed_rate_details}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{color: '#c97ab4', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Hourly Rate</p>
                    <p className="text-4xl font-bold" style={{color: '#0a1628'}}>
                      {contractor.hourly_rate ? `$${contractor.hourly_rate}` : 'Request Quote'}
                      {contractor.hourly_rate && <span style={{color: '#6b7280', fontSize: '1rem', fontWeight: '400'}}>/hr</span>}
                    </p>
                  </>
                )}
              </div>

               <Button 
                 variant="outline" 
                 className="w-full transition-all duration-200"
                 style={{
                   borderColor: '#d97706',
                   color: '#d97706',
                   backgroundColor: 'rgba(217, 119, 6, 0.05)',
                   cursor: 'pointer',
                   boxShadow: '0 0 16px rgba(217, 119, 6, 0.2)',
                   border: '2px solid #d97706'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.1)';
                   e.currentTarget.style.boxShadow = '0 0 28px rgba(217, 119, 6, 0.4), inset 0 0 10px rgba(255,255,255,0.1)';
                   e.currentTarget.style.transform = 'translateY(-2px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.05)';
                   e.currentTarget.style.boxShadow = '0 0 16px rgba(217, 119, 6, 0.2)';
                   e.currentTarget.style.transform = 'translateY(0)';
                 }}
                 onClick={() => requireAuth('message this contractor', () => setMessagingPricingOpen(true))}
               >
                 <MessageSquare className="w-4 h-4 mr-2" />
                 Message
               </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{position:"relative", zIndex:2, background:"transparent", minHeight:"100vh"}}>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Professional Credentials */}
             <PublicCredentialsDisplay contractor={contractor} />

            {/* About */}
             {contractor.bio && (
                <Card className="p-8 border-2 border-slate-400/60 bg-slate-900/15 backdrop-blur-xl hover:shadow-lg transition-all duration-300 rounded-2xl">
                  <h2 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-slate-400/40">About</h2>
                  <p className="text-slate-100 leading-relaxed text-base">{contractor.bio}</p>
                </Card>
              )}

            {/* Specialties */}
            {(contractor.skills || contractor.certifications) && (
              <Card className="p-8 border-2 border-slate-400/60 bg-slate-900/15 backdrop-blur-xl hover:shadow-lg transition-all duration-300 rounded-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-slate-400/40">Expertise</h2>
                {contractor.skills && contractor.skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-100 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {contractor.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {contractor.certifications && contractor.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {contractor.certifications.map((cert) => (
                        <Badge key={cert} className="bg-green-100 text-green-800">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Services */}
            {services && services.length > 0 && (
              <div className="rounded-2xl border border-slate-200/50 bg-white/95 backdrop-blur-sm p-7 hover:shadow-lg transition-all duration-300">
                <ContractorServices services={services} />
              </div>
            )}

            {/* Portfolio */}
            {contractor.portfolio_images && contractor.portfolio_images.length > 0 && (
              <Card className="p-8 border-2 border-slate-400/60 bg-slate-900/15 backdrop-blur-xl hover:shadow-lg transition-all duration-300 rounded-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-slate-400/40">Portfolio</h2>
                <PortfolioDisplay images={contractor.portfolio_images} />
              </Card>
            )}

            {/* Completed Jobs */}
            {completedJobs && completedJobs.length > 0 && (
              <Card className="p-8 border-2 border-slate-400/60 bg-slate-900/15 backdrop-blur-xl hover:shadow-lg transition-all duration-300 rounded-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-slate-400/40">Recent Projects</h2>
                <div className="grid gap-4">
                  {completedJobs.map((job) => (
                    <div key={job.id} className="border border-slate-400/50 rounded-lg p-4 bg-slate-900/10">
                      <h3 className="font-semibold text-white">{job.job_title}</h3>
                      <p className="text-sm text-slate-200 mt-1">{job.scope_summary}</p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Completed
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && <ReviewsSection reviews={reviews} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-7">
            {/* Availability */}
            <Card className="p-8 border-2 border-slate-400/60 bg-slate-900/15 backdrop-blur-xl hover:shadow-lg transition-all duration-300 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3 pb-4 border-b border-slate-400/40">
                <Calendar className="w-5 h-5 text-blue-600" />
                Schedule
              </h3>
              <ContractorAvailabilityCalendar contractorId={contractorId} />
            </Card>

            {/* Quick Stats */}
            <Card className="p-8 border-2 border-slate-400/60 bg-slate-900/15 backdrop-blur-xl hover:shadow-lg transition-all duration-300 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-5 pb-4 border-b border-slate-400/40">Professional Details</h3>
             <div className="space-y-4">
               <div className="pb-4 border-b border-slate-400/30">
                 <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">Response Time</p>
                 <p className="font-semibold text-white text-base">Usually within 2 hours</p>
               </div>
               <div>
                 <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">Current Status</p>
                 <p className={`font-semibold text-base ${
                   contractor.availability_status === 'available' ? 'text-green-600' :
                   contractor.availability_status === 'booked' ? 'text-amber-600' : 'text-blue-600'
                 }`}>
                   {contractor.availability_status === 'available'
                     ? '✓ Available Now'
                     : contractor.availability_status === 'booked'
                     ? '⊙ Booked'
                     : '◕ On Vacation'}
                 </p>
               </div>
             </div>
           </Card>
          </div>
        </div>
      </div>

      <AuthGateModal open={authGateOpen} onClose={() => setAuthGateOpen(false)} action={authGateAction} />

      <MessagingPricingTable
        contractorId={contractor.id}
        contractorName={contractor.name}
        contractorEmail={contractor.email}
        open={messagingPricingOpen}
        onClose={() => setMessagingPricingOpen(false)}
        onMessagingUnlocked={() => {
          // Payment handled by Stripe redirect — Success page will redirect back here
          setMessagingPricingOpen(false);
        }}
      />

      {/* Inline chat modal — opens after successful timed payment redirect */}
      {chatOpen && contractor && (
        <div style={{position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.6)", padding:"16px"}} className="sm:items-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ height: '80vh' }}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Chat with {contractor.name}</h2>
                <p className="text-xs text-amber-600 font-semibold">10-minute session active</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                otherUserEmail={contractor.email}
                otherUserName={contractor.name}
                otherUserType="contractor"
                userEmail={chatUserEmail}
                userName={chatUserName}
                userType="customer"
                tier="timed"
                paymentId={chatPaymentId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}