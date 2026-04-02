import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// Track contact info view event
const trackContactInfoView = (contractorId, contractorName, contactType) => {
  base44.analytics.track({
    eventName: 'contractor_contact_info_viewed',
    properties: {
      contractor_id: contractorId,
      contractor_name: contractorName,
      contact_type: contactType, // 'phone', 'email', 'quote', 'service_request'
      timestamp: new Date().toISOString(),
    },
  });
};
import { Star, MessageSquare, MapPin, Award, Briefcase, Image as ImageIcon, ChevronLeft, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceRequestForm from '@/components/service-request/ServiceRequestForm';
import CredentialDisplayCard from '@/components/contractor/CredentialDisplayCard';

export default function ContractorPublicProfile() {
  const { contractorId } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [serviceRequestOpen, setServiceRequestOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [contractorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch contractor details
      const contractorData = await base44.entities.Contractor.filter({ id: contractorId });
      if (!contractorData || contractorData.length === 0) {
        navigate('/');
        return;
      }
      setContractor(contractorData[0]);

      // Fetch services
      const servicesData = await base44.entities.ServiceOffering.filter({ contractor_id: contractorId });
      setServices(servicesData || []);

      // Fetch verified reviews
      const reviewsData = await base44.entities.Review.filter({ contractor_id: contractorId, verified: true });
      setReviews((reviewsData || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

      // Fetch portfolio projects
      const portfolioData = await base44.entities.PortfolioProject.filter({ contractor_id: contractorId });
      setPortfolio(portfolioData || []);
    } catch (error) {
      console.error('Error fetching contractor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Contractor not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Contractor Profile</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Hero */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo & Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
              {contractor.photo_url ? (
                <img 
                  src={contractor.photo_url} 
                  alt={contractor.name}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                  <Briefcase className="w-16 h-16 text-slate-500" />
                </div>
              )}
              <div className="w-full">
                <h1 className="text-2xl font-bold mb-2">{contractor.name}</h1>
                {contractor.location && (
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{contractor.location}</span>
                  </div>
                )}
                {avgRating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-300">
                      {avgRating} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
                {contractor.years_experience && (
                  <div className="flex items-center gap-2 text-slate-300 mb-3">
                    <Award className="w-4 h-4" />
                    <span>{contractor.years_experience} years experience</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats & CTA */}
            <div className="flex-1 flex flex-col justify-between">
              {contractor.bio && (
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  {contractor.bio}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{contractor.completed_jobs_count || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Jobs Completed</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{contractor.unique_customers_count || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Clients Served</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{contractor.rating ? contractor.rating.toFixed(1) : 'N/A'}</div>
                  <div className="text-xs text-slate-400 mt-1">Avg Rating</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
               <a 
                  href={`/QuoteRequestWizard`}
                  onClick={() => trackContactInfoView(contractorId, contractor.name, 'quote')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Request a Quote
                </a>
               <button
                 onClick={() => {
                   trackContactInfoView(contractorId, contractor.name, 'service_request');
                   setServiceRequestOpen(true);
                 }}
                 className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-600"
               >
                 <ClipboardList className="w-5 h-5" />
                 Submit Service Request
               </button>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Section */}
         <div className="mb-8">
           <CredentialDisplayCard contractor={contractor} />
         </div>

         {/* Services Section */}
         {services.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors">
                  <h3 className="font-semibold text-lg mb-2">{service.service_name}</h3>
                  <p className="text-slate-300 text-sm mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">
                      {service.price_type === 'hourly' 
                        ? `$${service.price_amount}/hr`
                        : `$${service.price_amount}`
                      }
                    </span>
                    {service.estimated_duration && (
                      <span className="text-slate-400 text-sm">{service.estimated_duration}</span>
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
            <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.map(project => (
                <div key={project.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors">
                  {project.images && project.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden bg-slate-700 cursor-pointer group">
                      <img 
                        src={project.images[0].url}
                        alt={project.project_title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onClick={() => setSelectedImage(project.images[0].url)}
                      />
                      {project.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm">
                          +{project.images.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{project.project_title}</h3>
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex justify-between items-center text-sm text-slate-400">
                      <span>{project.trade_category || 'General'}</span>
                      <span>{new Date(project.completion_date).toLocaleDateString()}</span>
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
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{review.reviewer_name}</h3>
                      <p className="text-sm text-slate-400">{review.job_title}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          fill={i < review.overall_rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 mb-3">{review.comment}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.created_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>No reviews yet. Be the first to work with this contractor!</p>
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