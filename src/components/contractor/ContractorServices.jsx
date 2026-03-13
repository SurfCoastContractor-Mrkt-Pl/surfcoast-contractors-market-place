import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, ChevronDown, ChevronUp } from 'lucide-react';

function ServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false);

  const priceDisplay = {
    hourly: `$${service.price_amount}/hr`,
    fixed: `$${service.price_amount} fixed`,
    quote: 'Custom quote'
  };

  const badgeClass = {
    hourly: 'bg-blue-100 text-blue-700',
    fixed: 'bg-green-100 text-green-700',
    quote: 'bg-slate-100 text-slate-700'
  }[service.price_type] || 'bg-slate-100 text-slate-700';

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-slate-900 truncate">{service.service_name}</span>
          <Badge variant="secondary" className={`${badgeClass} flex-shrink-0 text-xs`}>
            {priceDisplay[service.price_type]}
          </Badge>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
          {service.description && (
            <p className="text-sm text-slate-700 mt-3 leading-relaxed">{service.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">{priceDisplay[service.price_type]}</span>
            </div>
            {service.estimated_duration && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-4 h-4" />
                <span>{service.estimated_duration}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContractorServices({ services }) {
  if (!services || services.length === 0) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Services & Packages</h2>
      <div className="space-y-2">
        {services.map((service, idx) => (
          <ServiceCard key={service.id || idx} service={service} />
        ))}
      </div>
    </Card>
  );
}