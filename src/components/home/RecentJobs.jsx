import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase } from 'lucide-react';
import JobCard from '../jobs/JobCard';

export default function RecentJobs({ jobs, isLoading }) {
  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-12" />
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-600 font-medium mb-1">
              <Briefcase className="w-4 h-4" />
              Open Opportunities
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Latest Job Postings
            </h2>
          </div>
          <Link to={createPageUrl('Jobs')} className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
              View All Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {jobs?.slice(0, 3).map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        
        {(!jobs || jobs.length === 0) && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No jobs posted yet. Be the first to post!</p>
            <Link to={createPageUrl('PostJob')}>
              <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900">
                Post a Job
              </Button>
            </Link>
          </div>
        )}
        
        <div className="text-center mt-8 md:hidden">
          <Link to={createPageUrl('Jobs')}>
            <Button variant="outline" className="border-amber-500 text-amber-600">
              View All Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}