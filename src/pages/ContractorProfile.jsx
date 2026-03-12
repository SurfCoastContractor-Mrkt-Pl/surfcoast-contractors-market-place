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

export default function ContractorProfile() {
  const [searchParams] = useSearchParams();
  const contractorId = searchParams.get('id');
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractor = async () => {
      try {
        if (!contractorId) {
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
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('FindContractors')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-4 mb-4">
                {contractor.photo_url && (
                  <img
                    src={contractor.photo_url}
                    alt={contractor.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900">{contractor.name}</h1>
                  <p className="text-slate-600 mt-1">{contractor.years_experience} years experience</p>
                  {contractor.identity_verified && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-semibold">Identity Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {contractor.rating && (
                  <Badge className="bg-amber-100 text-amber-800">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {contractor.rating.toFixed(1)} ({contractor.reviews_count} reviews)
                  </Badge>
                )}
                {contractor.completed_jobs_count && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {contractor.completed_jobs_count} Jobs Completed
                  </Badge>
                )}
                <Badge className="bg-slate-100 text-slate-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  {contractor.location}
                </Badge>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-amber-50 p-6 rounded-xl h-fit">
              <div className="mb-6">
                <p className="text-slate-600 mb-2 text-sm">Hourly Rate</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${contractor.hourly_rate}
                  <span className="text-lg text-slate-600">/hr</span>
                </p>
              </div>
              <Link to={createPageUrl('QuickJobPost')}>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 mb-3">
                  Post a Job
                </Button>
              </Link>
              <Link to={createPageUrl(`Messaging?contractor=${contractor.id}`)}>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </Link>
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
    </div>
  );
}