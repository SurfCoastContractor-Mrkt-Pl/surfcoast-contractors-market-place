import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ContractorCard from '../contractors/ContractorCard';

export default function FeaturedContractors({ contractors, isLoading }) {
  if (isLoading) {
    return (
      <section className="py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Top-Rated Contractors
            </h2>
            <p className="text-sm text-slate-600">
              Verified professionals ready to work
            </p>
          </div>
          <Link to={createPageUrl('Contractors')} className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contractors?.slice(0, 4).map(contractor => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
        
        <div className="text-center mt-4 md:hidden">
          <Link to={createPageUrl('Contractors')}>
            <Button variant="outline" size="sm" className="border-amber-500 text-amber-600">
              View All Contractors
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}