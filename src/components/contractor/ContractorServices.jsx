import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Wrench } from 'lucide-react';

export default function ContractorServices({ services }) {
  if (!services || services.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Services</h2>
        <p className="text-slate-500 text-sm">No services listed yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Services Offered</h2>
      <div className="space-y-4">
        {services.map((service, idx) => {
          const priceDisplay = {
            hourly: `$${service.price_amount}/hour`,
            fixed: `$${service.price_amount} total`,
            quote: 'Custom quote'
          };

          return (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{service.service_name}</h3>
                <Badge 
                  variant="secondary"
                  className={service.price_type === 'hourly' 
                    ? 'bg-blue-100 text-blue-700 ml-2' 
                    : service.price_type === 'fixed'
                    ? 'bg-green-100 text-green-700 ml-2'
                    : 'bg-slate-100 text-slate-700 ml-2'
                  }
                >
                  {service.price_type === 'hourly' ? 'Hourly Rate' : service.price_type === 'fixed' ? 'Fixed Price' : 'Quote Available'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-3">{service.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-900">{priceDisplay[service.price_type]}</span>
                </div>
                {service.estimated_duration && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{service.estimated_duration}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}