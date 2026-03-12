import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, MapPin, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Stock photos of diverse freelance workers
const STOCK_WORKER_PHOTOS = {
  electrician: 'https://images.unsplash.com/photo-1516321318423-f06f70e504f0?w=600&h=600&fit=crop',
  plumber: 'https://images.unsplash.com/photo-1581092162562-40038f5213da?w=600&h=600&fit=crop',
  carpenter: 'https://images.unsplash.com/photo-1604881991720-f91415f72393?w=600&h=600&fit=crop',
  painter: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
  hvac: 'https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=600&h=600&fit=crop',
  general: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop'
};

export default function ContractorCardWithPhoto({ contractor, onQuoteClick }) {
  const photoUrl = contractor.photo_url || contractor.face_photo_url || 
    STOCK_WORKER_PHOTOS[contractor.trade_specialty] || 
    STOCK_WORKER_PHOTOS.general;

  const rating = contractor.rating || 4.9;
  const reviewCount = contractor.reviews_count || 24;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-200">
      {/* Image container with overlay */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
        <img
          src={photoUrl}
          alt={contractor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {contractor.is_featured && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span>⭐</span> Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif font-bold text-lg text-slate-900 mb-1 line-clamp-1">
          {contractor.name}
        </h3>

        <p className="text-sm text-slate-600 mb-3 capitalize">
          {contractor.trade_specialty || contractor.line_of_work || 'Professional'}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-900">{rating.toFixed(1)}</span>
          <span className="text-xs text-slate-500">({reviewCount})</span>
        </div>

        {/* Location & Rate */}
        <div className="space-y-2 mb-4">
          {contractor.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-blue-600" />
              {contractor.location}
            </div>
          )}
          {contractor.hourly_rate && (
            <p className="text-lg font-bold text-blue-600">
              ${contractor.hourly_rate}<span className="text-sm text-slate-600">/hr</span>
            </p>
          )}
        </div>

        {/* Badges */}
        {contractor.identity_verified && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit mb-4">
            <Award className="w-3 h-3" />
            Verified
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onQuoteClick?.(contractor)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Get Quote
        </Button>
      </div>
    </div>
  );
}