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

import PortfolioDisplay from '@/components/contractor/PortfolioDisplay';
import ReviewsSection from '@/components/contractor/ReviewsSection';
import ContractorAvailabilityCalendar from '@/components/calendar/ContractorAvailabilityCalendar';
import MessagingPricingTable from '@/components/messaging/MessagingPricingTable';
import ContractorServices from '@/components/contractor/ContractorServices';

export default function ContractorProfile() {
  const [searchParams] = useSearchParams();
  const contractorId = searchParams.get('id');
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagingPricingOpen, setMessagingPricingOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative text-white overflow-hidden" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(0,0,0,0.62)'}}></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to={createPageUrl('FindContractors')}>
            <Button variant="ghost" className="mb-5 text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-5 mb-5">
                {contractor.photo_url ? (
                  <img
                    src={contractor.photo_url}
                    alt={contractor.name}
                    className="w-24 h-24 rounded-xl object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-3xl font-bold border-2 border-white/30" style={{backgroundColor: '#1E5A96'}}>
                    {contractor.name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white">{contractor.name}</h1>
                  {contractor.years_experience && <p className="text-white/75 mt-1">{contractor.years_experience} years experience</p>}
                  {contractor.identity_verified && (
                    <div className="flex items-center gap-2 mt-2 text-green-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-semibold">Identity Verified</span>
                    </div>
                  )}
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
            <div className="bg-white p-6 rounded-xl h-fit shadow-xl">
              <div className="mb-5">
                {contractor.rate_type === 'fixed' ? (
                  <>
                    <p className="text-slate-500 mb-1 text-sm">Fixed Rate</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {contractor.fixed_rate ? `$${contractor.fixed_rate}` : 'Request Quote'}
                      <span className="text-lg text-slate-500 ml-1">fixed</span>
                    </p>
                    {contractor.fixed_rate_details && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{contractor.fixed_rate_details}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 mb-1 text-sm">Hourly Rate</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {contractor.hourly_rate ? `$${contractor.hourly_rate}` : 'Request Quote'}
                      {contractor.hourly_rate && <span className="text-lg text-slate-500">/hr</span>}
                    </p>
                  </>
                )}
              </div>
              <Link to={createPageUrl('QuickJobPost')}>
                <Button className="w-full text-white mb-3" style={{backgroundColor: '#1E5A96'}}>
                  Post a Job
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-slate-300"
                onClick={() => setMessagingPricingOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            {contractor.bio && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                <p className="text-slate-700 leading-relaxed">{contractor.bio}</p>
              </Card>
            )}

            {/* Specialties */}
            {(contractor.skills || contractor.certifications) && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Expertise</h2>
                {contractor.skills && contractor.skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills</h3>
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
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Certifications</h3>
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
              <ContractorServices services={services} />
            )}

            {/* Portfolio */}
            {contractor.portfolio_images && contractor.portfolio_images.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio</h2>
                <PortfolioDisplay images={contractor.portfolio_images} />
              </Card>
            )}

            {/* Completed Jobs */}
            {completedJobs && completedJobs.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Projects</h2>
                <div className="grid gap-4">
                  {completedJobs.map((job) => (
                    <div key={job.id} className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900">{job.job_title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{job.scope_summary}</p>
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
          <div className="space-y-6">
            {/* Availability */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Availability
              </h3>
              <ContractorAvailabilityCalendar contractorId={contractorId} />
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">At a Glance</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Response Time</p>
                  <p className="font-semibold text-slate-900">Usually within 2 hours</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Availability</p>
                  <p className="font-semibold text-slate-900">
                    {contractor.availability_status === 'available'
                      ? 'Available Now'
                      : contractor.availability_status === 'booked'
                      ? 'Booked'
                      : 'On Vacation'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <MessagingPricingTable
        contractorId={contractor.id}
        contractorName={contractor.name}
        contractorEmail={contractor.email}
        open={messagingPricingOpen}
        onClose={() => setMessagingPricingOpen(false)}
        onMessagingUnlocked={() => {
          // Navigate to messaging after payment
          window.location.href = createPageUrl(`Messaging?contractor=${contractor.id}`);
        }}
      />
    </div>
  );
}