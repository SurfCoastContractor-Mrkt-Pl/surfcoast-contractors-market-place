import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

const urgencyColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const tradeLabels = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  carpenter: 'Carpenter',
  hvac: 'HVAC Tech',
  mason: 'Mason',
  roofer: 'Roofer',
  painter: 'Painter',
  welder: 'Welder',
  tiler: 'Tiler',
  landscaper: 'Landscaper',
  other: 'Other'
};

export default function JobCard({ job }) {

  const formatBudget = () => {
    if (!job.budget_min && !job.budget_max) return 'Negotiable';
    if (job.budget_min && job.budget_max) {
      return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
    }
    if (job.budget_max) return `Up to $${job.budget_max.toLocaleString()}`;
    return `From $${job.budget_min.toLocaleString()}`;
  };

  return (
    <Link to={createPageUrl(`JobDetails?id=${job.id}`)}>
      <Card className="group p-6 hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-amber-400">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-amber-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Posted by {job.poster_name}
            </p>
          </div>
          <Badge className={urgencyColors[job.urgency]}>
            {job.urgency === 'urgent' ? '🔥 Urgent' : job.urgency}
          </Badge>
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="border-slate-300">
            {job.contractor_type_needed === 'trade_specific' 
              ? tradeLabels[job.trade_needed] || 'Trade Specific'
              : job.contractor_type_needed === 'general' 
                ? 'General Contractor'
                : 'Any Contractor'
            }
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            {job.location}
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-400" />
            {formatBudget()}
            {job.budget_type && <span className="text-slate-400">({job.budget_type})</span>}
          </div>
          {job.start_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {format(new Date(job.start_date), 'MMM d, yyyy')}
            </div>
          )}
          {job.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {job.duration}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}