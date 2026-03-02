import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ContractorCard from '../contractors/ContractorCard';

export default function FeaturedContractors({ contractors, isLoading }) {
  if (isLoading) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Top-Rated Contractors
            </h2>
            <p className="text-lg text-slate-600">
              Verified professionals ready to take on your project
            </p>
          </div>
          <Link to={createPageUrl('Contractors')} className="hidden md:block">
            <Button variant="ghost" className="text-amber-600 hover:text-amber-700">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractors?.slice(0, 6).map(contractor => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
        
        <div className="text-center mt-8 md:hidden">
          <Link to={createPageUrl('Contractors')}>
            <Button variant="outline" className="border-amber-500 text-amber-600">
              View All Contractors
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}