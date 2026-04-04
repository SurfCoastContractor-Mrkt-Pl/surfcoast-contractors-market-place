import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/hooks/useUserData';
import { Star, MessageSquare, MapPin, Award, Briefcase, Image as ImageIcon, ChevronLeft, ClipboardList, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceRequestForm from '@/components/service-request/ServiceRequestForm';
import CredentialDisplayCard from '@/components/contractor/CredentialDisplayCard';
import CustomerBookingCalendar from '@/components/calendar/CustomerBookingCalendar';

const trackContactInfoView = (contractorId, contractorName, contactType) => {
  base44.analytics.track({
    eventName: 'contractor_contact_info_viewed',
    properties: { contractor_id: contractorId, contractor_name: contractorName, contact_type: contactType, timestamp: new Date().toISOString() },
  });
};

export default function ContractorPublicProfile() {
  const { contractorId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [serviceRequestOpen, setServiceRequestOpen] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const { user: currentUser } = useUserData();

  // Fire-and-forget profile view tracking
  useEffect(() => {
    base44.functions.invoke('trackProfileView', { contractor_id: contractorId }).catch(() => {});
  }, [contractorId]);

  const { data: contractorData, isLoading: loadingContractor } = useQuery({
    queryKey: ['contractor-profile', contractorId],
    queryFn: () => base44.entities.Contractor.filter({ id: contractorId }),
    staleTime: 5 * 60 * 1000,
  });

  const contractor = contractorData?.[0] ?? null;

  const { data: services = [] } = useQuery({
    queryKey: ['contractor-services-public', contractorId],
    queryFn: () => base44.entities.ServiceOffering.filter({ contractor_id: contractorId }),
    enabled: !!contractor,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawReviews = [] } = useQuery({
    queryKey: ['contractor-reviews-public', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId, verified: true }),
    enabled: !!contractor,
    staleTime: 5 * 60 * 1000,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['contractor-portfolio-public', contractorId],
    queryFn: () => base44.entities.PortfolioProject.filter({ contractor_id: contractorId }),
    enabled: !!contractor,
    staleTime: 10 * 60 * 1000,
  });

  const reviews = [...rawReviews].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const loading = loadingContractor;

  useEffect(() => {
    if (!loadingContractor && contractorData && contractorData.length === 0) {
      navigate('/');
    }
  }, [loadingContractor, contractorData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contractor not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-600 hover:text-orange-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900">Contractor Profile</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Hero */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-2 border-orange-100 shadow-lg shadow-orange-50">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo & Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
              {contractor.photo_url ? (
                <img
                  src={contractor.photo_url}
                  alt={contractor.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-orange-200 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-orange-50 flex items-center justify-center border-2 border-orange-200">
                  <Briefcase className="w-16 h-16 text-orange-300" />
                </div>
              )}
              <div className="w-full">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{contractor.name}</h1>
                {contractor.location && (
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{contractor.location}</span>
                  </div>
                )}
                {avgRating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-amber-400"
                          fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {avgRating} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
                {contractor.years_experience && (
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{contractor.years_experience} yrs experience</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats & CTA */}
            <div className="flex-1 flex flex-col justify-between">
              {contractor.bio && (
                <p className="text-gray-600 text-base leading-relaxed mb-6">{contractor.bio}</p>
              )}

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { value: contractor.completed_jobs_count || 0, label: "Jobs Done" },
                  { value: contractor.unique_customers_count || 0, label: "Clients" },
                  { value: contractor.rating ? contractor.rating.toFixed(1) : "—", label: "Avg Rating" },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                    <div className="text-2xl font-extrabold text-orange-600">{value}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                {contractor.availability_status === 'available' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-700">Available for new work</span>
                  </div>
                ) : contractor.availability_status === 'booked' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full flex-shrink-0" />
                    <span className="text-sm font-semibold text-amber-700">Currently booked — limited availability</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="w-2.5 h-2.5 bg-gray-300 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-400">Availability not listed</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="/QuoteRequestWizard"
                  onClick={() => trackContactInfoView(contractorId, contractor.name, 'quote')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  Request a Quote
                </a>
                <button
                  onClick={() => { trackContactInfoView(contractorId, contractor.name, 'service_request'); setServiceRequestOpen(true); }}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-gray-200 hover:border-orange-300"
                >
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                  Submit Service Request
                </button>
                <button
                  onClick={() => setShowBooking(!showBooking)}
                  className="w-full bg-white hover:bg-orange-50 text-orange-600 font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-orange-200 hover:border-orange-400"
                >
                  <Calendar className="w-4 h-4" />
                  {showBooking ? 'Hide Availability' : 'View Availability & Book'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Calendar */}
        {showBooking && (
          <div className="mb-8">
            <CustomerBookingCalendar
              contractorId={contractor.id}
              contractorEmail={contractor.email}
              contractorName={contractor.name}
              customerEmail={currentUser?.email || ''}
              customerName={currentUser?.full_name || 'Guest'}
            />
          </div>
        )}

        {/* Credentials Section */}
        <div className="mb-8">
          <CredentialDisplayCard contractor={contractor} />
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Services Offered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{service.service_name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-orange-600">
                      {service.price_type === 'hourly' ? `$${service.price_amount}/hr` : `$${service.price_amount}`}
                    </span>
                    {service.estimated_duration && (
                      <span className="text-gray-400 text-sm">{service.estimated_duration}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Gallery */}
        {portfolio.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.map(project => (
                <div key={project.id} className="bg-white rounded-xl overflow-hidden border-2 border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                  {project.images && project.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden bg-gray-100 cursor-pointer group">
                      <img
                        src={project.images[0].url}
                        alt={project.project_title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onClick={() => setSelectedImage(project.images[0].url)}
                      />
                      {project.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm text-white">
                          +{project.images.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{project.project_title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-orange-600 font-medium capitalize">{project.trade_category || 'General'}</span>
                      <span className="text-gray-400">{new Date(project.completion_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-orange-100 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{review.reviewer_name}</h3>
                      <p className="text-sm text-gray-400">{review.job_title}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400" fill={i < review.overall_rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  <p className="text-xs text-gray-400">{new Date(review.created_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No reviews yet.</p>
            <p className="text-gray-400 text-sm">Be the first to work with this contractor!</p>
          </div>
        )}
      </main>

      {/* Service Request Modal */}
      {contractor && (
        <ServiceRequestForm
          isOpen={serviceRequestOpen}
          onClose={() => setServiceRequestOpen(false)}
          professional={{ ...contractor, type: 'contractor' }}
        />
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Gallery" className="max-h-[90vh] max-w-[90vw] rounded-lg" />
        </div>
      )}
    </div>
  );
}