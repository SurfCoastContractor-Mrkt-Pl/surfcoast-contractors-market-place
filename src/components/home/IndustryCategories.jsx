import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Code, PenTool, Camera, Music, Briefcase, Users, 
  TrendingUp, Shield, Heart, Lightbulb, MoreHorizontal 
} from 'lucide-react';

const industries = [
  { id: 'freelance_developer', name: 'Developers', icon: Code, color: 'bg-blue-600' },
  { id: 'freelance_designer', name: 'Designers', icon: PenTool, color: 'bg-pink-500' },
  { id: 'freelance_photographer', name: 'Photographers', icon: Camera, color: 'bg-purple-500' },
  { id: 'musician', name: 'Musicians', icon: Music, color: 'bg-indigo-600' },
  { id: 'consultant', name: 'Consultants', icon: Briefcase, color: 'bg-slate-600' },
  { id: 'tutor_educator', name: 'Tutors', icon: Users, color: 'bg-green-600' },
  { id: 'marketing_specialist', name: 'Marketing', icon: TrendingUp, color: 'bg-orange-500' },
  { id: 'virtual_assistant', name: 'VA Services', icon: Lightbulb, color: 'bg-yellow-500' },
  { id: 'therapist', name: 'Therapists', icon: Heart, color: 'bg-red-500' },
  { id: 'accountant', name: 'Accountants', icon: Shield, color: 'bg-emerald-600' },
];

export default function IndustryCategories() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Browse by Industry
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find skilled professionals across diverse fields and services
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Link
                key={industry.id}
                to={createPageUrl(`Contractors?line=${industry.id}`)}
                className="group flex flex-col items-center p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className={`w-12 h-12 rounded-xl ${industry.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900 text-sm">
                  {industry.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <Link
            to={createPageUrl('Contractors')}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            <MoreHorizontal className="w-5 h-5" />
            View All Professionals
          </Link>
        </div>
      </div>
    </section>
  );
}