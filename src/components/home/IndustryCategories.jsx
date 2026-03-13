import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Code, PenTool, Camera, Music, Briefcase, MoreHorizontal 
} from 'lucide-react';

const industries = [
  { id: 'freelance_developer', name: 'Developers', icon: Code, color: 'bg-blue-600' },
  { id: 'freelance_designer', name: 'Designers', icon: PenTool, color: 'bg-pink-500' },
  { id: 'freelance_photographer', name: 'Photographers', icon: Camera, color: 'bg-purple-500' },
  { id: 'musician', name: 'Musicians', icon: Music, color: 'bg-indigo-600' },
  { id: 'consultant', name: 'Consultants', icon: Briefcase, color: 'bg-slate-600' },
];

export default function IndustryCategories() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Browse by Industry
          </h2>
          <p className="text-slate-600 text-sm">
            Find skilled professionals across diverse fields and services
          </p>
        </div>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Link
                key={industry.id}
                to={createPageUrl(`Contractors?line=${industry.id}`)}
                className="group flex flex-col items-center p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className={`w-9 h-9 rounded-lg ${industry.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900 text-xs text-center">
                  {industry.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-6">
          <Link
            to={createPageUrl('Contractors')}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm"
          >
            <MoreHorizontal className="w-4 h-4" />
            View All Industries
          </Link>
        </div>
      </div>
    </section>
  );
}