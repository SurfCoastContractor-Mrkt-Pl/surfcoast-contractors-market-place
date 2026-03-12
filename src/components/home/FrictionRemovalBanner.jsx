import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function FrictionRemovalBanner() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Gift className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              🎁 <strong>Limited Time:</strong> First quote request FREE + Browse unlimited contractors with zero commitment
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Link to={createPageUrl('FindContractors')}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Claim Offer
            </Button>
          </Link>
          <button onClick={() => setClosed(true)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}