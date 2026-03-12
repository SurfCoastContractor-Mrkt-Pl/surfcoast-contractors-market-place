import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, MapPin, DollarSign, Clock, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const LOCATION_DATA = {
  'Los Angeles': {
    name: 'Los Angeles, CA',
    coords: { lat: 34.0522, lng: -118.2437 },
    description: 'Premium contractor marketplace for Los Angeles & Southern California',
    topTrades: ['Plumbing', 'Electrical', 'HVAC', 'Carpentry'],
    avgPrice: '$85/hour',
    serviceArea: '50+ miles'
  },
  'San Francisco': {
    name: 'San Francisco, CA',
    coords: { lat: 37.7749, lng: -122.4194 },
    description: 'Bay Area\'s trusted platform for verified professionals',
    topTrades: ['Electrical', 'Plumbing', 'Carpentry', 'HVAC'],
    avgPrice: '$95/hour',
    serviceArea: '40+ miles'
  },
  'Austin': {
    name: 'Austin, TX',
    coords: { lat: 30.2672, lng: -97.7431 },
    description: 'Austin\'s fastest-growing contractor marketplace',
    topTrades: ['Carpentry', 'Roofing', 'Painting', 'Landscaping'],
    avgPrice: '$75/hour',
    serviceArea: '60+ miles'
  }
};

export default function LocalLanding() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Los Angeles');
  const locationData = LOCATION_DATA[location] || LOCATION_DATA['Los Angeles'];

  const { data: contractors = [] } = useQuery({
    queryKey: ['local-contractors', location],
    queryFn: async () => {
      try {
        const result = await base44.entities.Contractor.filter({ 
          available: true, 
          identity_verified: true 
        }, null, 6);
        return result || [];
      } catch {
        return [];
      }
    }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header with beach theme */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 border-b border-blue-700/50 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,64 Q300,20 600,64 T1200,64 L1200,120 L0,120 Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6 text-center">
            <span className="inline-block text-5xl mb-4">🏖️</span>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">
              Hire Vetted Contractors in {locationData.name}
            </h1>
            <p className="text-lg text-blue-50">
              {locationData.description}
            </p>
          </div>

          {/* Location selector */}
          <div className="flex gap-3 flex-wrap">
            {Object.keys(LOCATION_DATA).map(loc => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  location === loc
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trust badges */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Verified Professionals</p>
              <p className="text-sm text-slate-600">ID & background checked</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">5-Star Reviews</p>
              <p className="text-sm text-slate-600">Real customer testimonials</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Fast Quotes</p>
              <p className="text-sm text-slate-600">Responses in hours, not days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Transparent Pricing</p>
              <p className="text-sm text-slate-600">No hidden fees or markups</p>
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-serif font-bold text-blue-600 mb-2">500+</p>
              <p className="text-slate-700">Verified Contractors</p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-blue-600 mb-2">4.9★</p>
              <p className="text-slate-700">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-blue-600 mb-2">2000+</p>
              <p className="text-slate-700">Jobs Completed</p>
            </div>
          </div>
        </div>

        {/* Featured contractors */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8">
            Popular Professionals in {locationData.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contractors.slice(0, 3).map(contractor => (
              <Link key={contractor.id} to={createPageUrl(`ContractorProfile?id=${contractor.id}`)}>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <img 
                    src={contractor.photo_url || contractor.face_photo_url}
                    alt={contractor.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-1">{contractor.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{contractor.trade_specialty || contractor.line_of_work}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{contractor.rating?.toFixed(1) || 5.0}</span>
                        <span className="text-xs text-slate-600">({contractor.reviews_count || 0})</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 font-semibold">${contractor.hourly_rate}/hr</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Get free quotes from multiple vetted professionals in {locationData.name}. No credit card required.
          </p>
          <Link to={createPageUrl('FindContractors')}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg">
              Find Contractors Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}