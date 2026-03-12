import React from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function EnhancedHeroSection() {
  return (
    <div className="pt-20 pb-16 border-b border-slate-200/50 relative" style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/9f9e7efe6_Capture.PNG)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="absolute inset-0" style={{backgroundColor: 'rgba(0, 0, 0, 0.40)'}}></div>
      <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Value Proposition */}
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{backgroundColor: '#1E5A96', color: 'white'}}>
              ✓ Verified & Vetted Professionals
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Find Premium Contractors,<br />
              <span style={{color: '#1E5A96'}}>No Markups</span>
            </h1>

            <p className="text-lg text-slate-100 mb-8 font-light leading-relaxed">
              Skip middlemen & inflated prices. Connect directly with verified professionals. Same-day quotes, transparent pricing, zero hidden fees.
            </p>

            {/* Trust Badges */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">98% 5-star rated by customers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">12-hour average response time</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">All contractors identity-verified</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('FindContractors')}>
                <Button size="lg" className="text-white font-semibold w-full sm:w-auto" style={{backgroundColor: '#1E5A96'}}>
                  Browse Contractors (Free) <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('QuickJobPost')}>
                <Button size="lg" className="text-white font-medium w-full sm:w-auto" style={{backgroundColor: '#1E5A96'}}>
                  Post a Project
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-sm text-white/70 mb-3 font-medium">TRUSTED BY</p>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold text-white">2,500+</p>
                  <p className="text-sm text-white/70">Verified Professionals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">$5M+</p>
                  <p className="text-sm text-white/70">Work Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">15K+</p>
                  <p className="text-sm text-white/70">Projects Booked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual or Image Placeholder */}
          <div className="rounded-2xl h-96 flex items-center justify-center border-2 border-white/40" style={{backgroundColor: 'rgba(30, 90, 150, 0.2)'}}>
            <div className="text-center">
              <div className="inline-block p-4 rounded-xl shadow-md mb-4" style={{backgroundColor: '#1E5A96'}}>
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">No Hidden Fees</h3>
              <p className="text-sm text-white/80 mt-2">Direct pricing from professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}