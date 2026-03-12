import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

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
  other: 'Other Trade'
};

export default function ContractorCard({ contractor }) {
  return (
    <Link to={createPageUrl(`ContractorProfile?id=${contractor.id}`)}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-slate-200 hover:border-amber-400">
        <div className="p-2.5">
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100">
                {contractor.photo_url ? (
                  <img 
                    src={contractor.photo_url} 
                    alt={contractor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xl font-bold">
                    {contractor.name?.charAt(0)}
                  </div>
                )}
              </div>
              {contractor.available && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle2 className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1.5">
                <h3 className="font-semibold text-xs text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                  {contractor.name}
                </h3>
                {contractor.rating && (
                  <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="font-medium text-xs">{contractor.rating}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs py-0.5 px-2 ${contractor.contractor_type === 'trade_specific' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {contractor.contractor_type === 'trade_specific' 
                    ? tradeLabels[contractor.trade_specialty] || 'Trade Specialist'
                    : 'General Contractor'
                  }
                </Badge>
                {contractor.availability_status && (
                  <StatusBadge status={contractor.availability_status} size="sm" />
                )}
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {contractor.location}
              </div>
              {contractor.years_experience && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {contractor.years_experience} years exp.
                </div>
              )}
            </div>
            
            {contractor.hourly_rate && (
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">${contractor.hourly_rate}</span>
                <span className="text-xs text-slate-500">/hour</span>
              </div>
            )}
          </div>
          
          {/* Certifications Preview */}
          {contractor.certifications?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {contractor.certifications.slice(0, 2).map((cert, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-2 h-2 text-green-500" />
                  {cert}
                </span>
              ))}
              {contractor.certifications.length > 2 && (
                <span className="text-xs text-slate-500 px-1.5 py-0.5">
                  +{contractor.certifications.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}