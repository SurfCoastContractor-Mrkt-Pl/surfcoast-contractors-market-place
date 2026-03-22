import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Store, MapPin, Grid3x3, Warehouse, Star, Search, Filter, Loader2 } from 'lucide-react';

const BrowseOption = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
      <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
    </div>
  </button>
);

const SectionCard = ({ icon: Icon, title, options }) => (
  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-white border-2 border-slate-300">
        <Icon className="w-6 h-6 text-slate-700" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="space-y-4">
      {options.map((option, idx) => (
        <BrowseOption key={idx} {...option} />
      ))}
    </div>
  </div>
);

export default function BoothsAndVendors() {
  const navigate = useNavigate();

  const farmersMarketOptions = [
    {
      icon: MapPin,
      title: 'Browse Market Locations',
      description: 'Explore specific farmers markets and see their ratings and details',
      onClick: () => navigate('/FarmersMarketRatings'),
    },
    {
      icon: Store,
      title: 'Browse by Shop/Booth',
      description: 'Find farmers market vendors and their products',
      onClick: () => navigate('/MarketDirectory?type=farmers_market&mode=shop'),
    },
  ];

  const swapMeetOptions = [
    {
      icon: MapPin,
      title: 'Browse SwapMeet Locations',
      description: 'Explore specific swap meet venues and see their ratings and details',
      onClick: () => navigate('/SwapMeetRatings'),
    },
    {
      icon: Warehouse,
      title: 'Browse by Space',
      description: 'Find swap meet vendors and their available spaces',
      onClick: () => navigate('/MarketDirectory?type=swap_meet&mode=space'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
              Booths & Vendors
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover amazing local vendors at farmers markets and swap meets. Choose how you'd like to browse.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-12">
          {/* Farmers Markets Section */}
          <SectionCard
            icon={Store}
            title="🌾 Farmers Markets"
            options={farmersMarketOptions}
          />

          {/* Swap Meets Section */}
          <SectionCard
            icon={Warehouse}
            title="♻️ Swap Meets"
            options={swapMeetOptions}
          />
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Market Locations</h3>
            <p className="text-sm text-blue-700">
              View aggregated vendor ratings and details about specific markets and venues.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">🏪 Shop/Booth Browsing</h3>
            <p className="text-sm text-amber-700">
              Discover individual vendors and shops with their unique products and offerings.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">⭐ Ratings & Reviews</h3>
            <p className="text-sm text-green-700">
              See real vendor feedback and market ratings to make informed choices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}