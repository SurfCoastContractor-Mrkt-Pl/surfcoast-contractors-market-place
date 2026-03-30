import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthTopBar from '@/components/auth/AuthTopBar';
import {
  HardHat, BarChart3, Briefcase, User, DollarSign,
  FileText, Settings, Star, Users, MessageCircle,
  ClipboardList, TrendingUp, ShieldCheck, Gift, Wrench,
  ChevronRight, Building2, Calendar, Package, Layers
} from 'lucide-react';

const portalSections = [
  {
    category: 'Core Tools',
    items: [
      {
        title: 'Wave FO',
        description: 'Field operations: job scheduling, invoicing, GPS tracking, and on-site tools.',
        icon: HardHat,
        color: 'bg-amber-500',
        path: '/WaveFo',
        badge: 'Field Ops'
      },
      {
        title: 'Contractor Business Hub',
        description: 'Manage your business: leads, earnings, analytics, CRM, marketing, and growth tools.',
        icon: Building2,
        color: 'bg-blue-600',
        path: '/ContractorBusinessHub',
        badge: 'Business'
      },
      {
        title: 'Financial Dashboard',
        description: 'View earnings summaries, platform fees, payout history, and revenue charts.',
        icon: DollarSign,
        color: 'bg-emerald-600',
        path: '/ContractorFinancialDashboard',
        badge: 'Finance'
      },
    ]
  },
  {
    category: 'Profile & Credentials',
    items: [
      {
        title: 'My Profile',
        description: 'Edit your public profile, bio, skills, certifications, and availability.',
        icon: User,
        color: 'bg-violet-600',
        path: '/ContractorAccount?section=profile',
        badge: 'Profile'
      },
      {
        title: 'Portfolio & Gallery',
        description: 'Showcase your work with before/after photos, case studies, and project galleries.',
        icon: Layers,
        color: 'bg-pink-600',
        path: '/ContractorAccount?section=portfolio',
        badge: 'Portfolio'
      },
      {
        title: 'Badges & Achievements',
        description: 'Track your earned badges, tier progress, and platform recognition.',
        icon: Star,
        color: 'bg-yellow-500',
        path: '/ContractorAccount?section=badges',
        badge: 'Badges'
      },
    ]
  },
  {
    category: 'Jobs & Projects',
    items: [
      {
        title: 'My Jobs',
        description: 'Browse open jobs, view active job postings, and apply to new opportunities.',
        icon: Briefcase,
        color: 'bg-sky-600',
        path: '/ContractorAccount?section=my-jobs',
        badge: 'Jobs'
      },
      {
        title: 'Scopes of Work',
        description: 'Review, manage, and close out your active scope of work agreements.',
        icon: FileText,
        color: 'bg-orange-500',
        path: '/ContractorAccount?section=scopes',
        badge: 'Scopes'
      },
      {
        title: 'Proposals & Quotes',
        description: 'Manage incoming quote requests and send proposals to potential clients.',
        icon: ClipboardList,
        color: 'bg-teal-600',
        path: '/ContractorAccount?section=quotes',
        badge: 'Quotes'
      },
      {
        title: 'Scheduling',
        description: 'Set availability, manage bookings, and plan your work calendar.',
        icon: Calendar,
        color: 'bg-indigo-600',
        path: '/ContractorAccount?section=scheduling',
        badge: 'Schedule'
      },
    ]
  },
  {
    category: 'Growth & Engagement',
    items: [
      {
        title: 'Analytics & Performance',
        description: 'Deep-dive metrics on job performance, customer ratings, and business trends.',
        icon: TrendingUp,
        color: 'bg-rose-600',
        path: '/ContractorAccount?section=analytics',
        badge: 'Analytics'
      },
      {
        title: 'Reviews & Testimonials',
        description: 'Manage customer reviews, respond to feedback, and pin testimonials.',
        icon: MessageCircle,
        color: 'bg-cyan-600',
        path: '/ContractorAccount?section=testimonials',
        badge: 'Reviews'
      },
      {
        title: 'Referrals',
        description: 'Earn credits by referring new contractors and customers to the platform.',
        icon: Gift,
        color: 'bg-lime-600',
        path: '/ContractorAccount?section=referrals',
        badge: 'Referrals'
      },
      {
        title: 'CRM & Clients',
        description: 'Track your client relationships, contact history, and follow-ups.',
        icon: Users,
        color: 'bg-fuchsia-600',
        path: '/ContractorAccount?section=crm',
        badge: 'CRM'
      },
    ]
  },
  {
    category: 'Account',
    items: [
      {
        title: 'Inventory & Equipment',
        description: 'Track your tools, equipment inventory, and get low-stock alerts.',
        icon: Package,
        color: 'bg-stone-600',
        path: '/ContractorAccount?section=inventory',
        badge: 'Inventory'
      },
      {
        title: 'Documents & Compliance',
        description: 'Upload licenses, bonds, insurance documents, and compliance certificates.',
        icon: ShieldCheck,
        color: 'bg-green-700',
        path: '/ContractorAccount?section=documents',
        badge: 'Docs'
      },
      {
        title: 'Platform Fees & Payouts',
        description: 'View platform fees, download invoices, and manage Stripe payout setup.',
        icon: BarChart3,
        color: 'bg-blue-800',
        path: '/ContractorAccount?section=fees',
        badge: 'Payouts'
      },
      {
        title: 'Account Settings',
        description: 'Manage security, contact info, payment methods, and account preferences.',
        icon: Settings,
        color: 'bg-slate-600',
        path: '/ContractorAccount?section=settings',
        badge: 'Settings'
      },
    ]
  }
];

export default function ContractorAccount() {
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  const navigate = useNavigate();
  const [contractorName, setContractorName] = useState('');

  useEffect(() => {
    // If a section param is present, redirect to the full hub page with that tab
    if (section) {
      navigate('/ContractorBusinessHub?tab=' + section, { replace: true });
      return;
    }

    base44.auth.me().then(user => {
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }
      base44.entities.Contractor.filter({ email: user.email }).then(results => {
        if (results?.[0]?.name) setContractorName(results[0].name);
      });
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, [section]);

  if (section) return null; // redirecting

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <AuthTopBar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-slate-900">
              <HardHat className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Contractor Portal
              </h1>
              {contractorName && (
                <p className="text-slate-500 mt-0.5">Welcome back, {contractorName}</p>
              )}
              {!contractorName && (
                <p className="text-slate-500 mt-0.5">Your central hub for all contractor tools & pages</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {portalSections.map(section => (
          <div key={section.category}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className="group text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-400 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}