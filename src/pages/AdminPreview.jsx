import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, UserPlus, User, Briefcase, FileText, Home, ArrowRight } from 'lucide-react';

const PREVIEW_PAGES = [
  {
    title: 'Contractor Registration Form',
    description: 'Full sign-up form with industry dropdown, skills, ID upload, minor consent, etc.',
    icon: UserPlus,
    href: `${createPageUrl('BecomeContractor')}?preview=true`,
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Contractor Profile View',
    description: 'Public-facing profile page as a visitor would see it (loads first available contractor).',
    icon: User,
    href: createPageUrl('ContractorProfile'),
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Post a Job Form',
    description: 'Customer job posting flow with all fields and photo upload.',
    icon: Briefcase,
    href: createPageUrl('QuickJobPost'),
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
  },
  {
    title: 'Find Contractors',
    description: 'Search/filter page for browsing contractors.',
    icon: Eye,
    href: createPageUrl('FindContractors'),
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Job Listings',
    description: 'Browse open jobs board as a contractor would see it.',
    icon: FileText,
    href: createPageUrl('Jobs'),
    color: 'bg-slate-50 border-slate-200',
    iconColor: 'text-slate-600',
  },
  {
    title: 'Home / Landing Page',
    description: 'Full landing page with hero, CTAs, and social proof sections.',
    icon: Home,
    href: createPageUrl('Home'),
    color: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600',
  },
];

export default function AdminPreview() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Eye className="w-3 h-3" /> ADMIN PREVIEW MODE
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Page Preview Hub</h1>
          <p className="text-slate-500 mt-2">
            Open any page in a clean state to test layout, forms, dropdowns, and interactive elements without affecting real data.
            Pages marked with <span className="font-semibold text-amber-700">?preview=true</span> bypass auth checks.
          </p>
        </div>

        <div className="space-y-3">
          {PREVIEW_PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <a key={page.title} href={page.href} target="_blank" rel="noopener noreferrer">
                <Card className={`p-5 border-2 ${page.color} hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-5 h-5 ${page.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{page.title}</h3>
                      <p className="text-sm text-slate-500">{page.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <strong>Tip:</strong> Pages open in a new tab. The contractor registration form loads blank so you can freely test all dropdowns and fields. No data will be saved unless you submit the form while logged in.
        </div>
      </div>
    </div>
  );
}