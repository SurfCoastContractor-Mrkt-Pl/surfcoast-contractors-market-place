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
      <Card className="group p-3 hover:shadow-md transition-all duration-300 border-slate-200 hover:border-amber-400">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {job.title}
            </h3>
          </div>
          <Badge className={`${urgencyColors[job.urgency]} text-xs py-0.5 px-1.5`}>
            {job.urgency === 'urgent' ? '🔥' : job.urgency.charAt(0).toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-slate-600 text-xs line-clamp-1 mb-2">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="border-slate-300 text-xs py-0.5 px-1.5">
            {job.contractor_type_needed === 'trade_specific' 
              ? (tradeLabels[job.trade_needed] || 'Trade').split(' ')[0]
              : job.contractor_type_needed === 'general' 
                ? 'General'
                : 'Any'
            }
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <DollarSign className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span>{formatBudget()}</span>
          </div>
          {job.start_date && (
            <div className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span>{format(new Date(job.start_date), 'MMM d')}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}