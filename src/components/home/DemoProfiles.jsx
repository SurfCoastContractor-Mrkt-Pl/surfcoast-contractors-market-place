import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';

export default function DemoProfiles() {
  // Fetch demo contractors and customers
  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['demo-contractors'],
    queryFn: () => base44.entities.Contractor.filter({ is_demo: true }, '-rating', 6),
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['demo-customers'],
    queryFn: () => base44.entities.CustomerProfile.filter({ is_demo: true }, '-created_date', 4),
  });

  if (contractorsLoading || customersLoading) {
    return <div className="text-center py-8 text-slate-500">Loading demo profiles...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Meet Our Community</h2>
          <p className="text-slate-600 max-w-2xl">
            Real contractors and customers using SurfCoast Marketplace to connect and get work done.
          </p>
        </div>

        {/* Contractors Grid */}
        {contractors && contractors.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Available Contractors</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractors.map(contractor => (
                <Link 
                  key={contractor.id}
                  to={createPageUrl('ContractorProfile')}
                  state={{ contractorId: contractor.id }}
                >
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
                    {/* Header */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-slate-900 text-lg">{contractor.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {contractor.location}
                      </div>
                    </div>

                    {/* Trade & Experience */}
                    <div className="mb-3">
                      <p className="text-sm text-slate-700 capitalize mb-1">
                        <span className="font-medium">{contractor.trade_specialty}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        {contractor.years_experience} years experience
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-slate-700 mb-4 line-clamp-3 min-h-[60px]">
                      {contractor.bio}
                    </p>

                    {/* Rating & Rate */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.round(contractor.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-600 ml-1">
                          {contractor.rating} ({contractor.reviews_count} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Rate */}
                    <p className="text-sm font-semibold text-slate-900 mb-4">
                      ${contractor.hourly_rate}/hr
                    </p>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        contractor.availability_status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {contractor.availability_status === 'available' ? 'Available' : 'Booked'}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Customers Section */}
        {customers && customers.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">People Posting Jobs</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {customers.map(customer => (
                <Card key={customer.id} className="p-5 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900 mb-2">{customer.full_name}</h4>
                  <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    {customer.location}
                  </div>
                  <p className="text-sm text-slate-700 mb-4 line-clamp-2 min-h-[40px]">
                    {customer.bio}
                  </p>
                  <p className="text-xs text-slate-500">
                    {customer.property_type?.replace(/_/g, ' ')}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Ready to find a contractor or post your first job?</p>
          <div className="flex gap-3 justify-center">
            <Link to={createPageUrl('FindContractors')}>
              <Button variant="outline">Browse Contractors</Button>
            </Link>
            <Link to={createPageUrl('QuickJobPost')}>
              <Button className="bg-blue-600 hover:bg-blue-700">Post a Job</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}