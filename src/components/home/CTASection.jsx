import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowRight, Search } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* For Customers - Find Contractors */}
          <div className="text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Find Contractors
            </h3>
            <p className="text-slate-300 mb-6">
              Browse skilled professionals in your area. Compare profiles, reviews, and rates to find the right contractor for your project.
            </p>
            <Link to={createPageUrl('Contractors')}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 w-full">
                <Search className="w-5 h-5 mr-2" />
                Browse Contractors
              </Button>
            </Link>
          </div>

          {/* For Customers - Post Jobs */}
          <div className="text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Post a Job
            </h3>
            <p className="text-slate-300 mb-6">
              Post your project and receive quotes from qualified contractors in your area. It's free and takes just minutes.
            </p>
            <Link to={createPageUrl('PostJob')}>
              <Button size="lg" variant="outline" className="border-slate-500 text-white hover:bg-slate-700 w-full">
                Post Your Job
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* For Contractors */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Are You a Contractor?
              </h3>
              <p className="text-amber-900 mb-6">
                Join thousands of professionals growing their business. 
                Create your profile and start getting hired today.
              </p>
              <ul className="space-y-2 mb-8">
                {['Free profile creation', 'Direct client contact', 'Build your reputation'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <span className="text-amber-500 text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('BecomeContractor')}>
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Your Profile
                </Button>
              </Link>
            </div>
          </div>
          
          {/* For Clients */}
          <div className="text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Looking to Hire?
            </h3>
            <p className="text-slate-300 mb-6">
              Post your project and receive quotes from qualified contractors in your area. 
              It's free and takes just minutes.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { title: 'Post Your Project', desc: 'Describe your needs and set your budget' },
                { title: 'Get Matched', desc: 'Receive interest from qualified contractors' },
                { title: 'Hire with Confidence', desc: 'Review profiles and choose the best fit' },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-slate-400">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to={createPageUrl('PostJob')}>
              <Button size="lg" variant="outline" className="border-slate-500 text-white hover:bg-slate-700">
                Post Your Job
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}