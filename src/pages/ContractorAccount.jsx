import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useUserData } from '@/hooks/useUserData';
import { useQuery } from '@tanstack/react-query';
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
        title: 'WAVE OS',
        description: 'Field operations: job scheduling, invoicing, GPS tracking, and on-site tools.',
        icon: HardHat,
        color: 'bg-amber-500',
        path: '/FieldOps',
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
        description: 'Earn credits by referring new entrepreneurs and clients to the platform.',
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

  const { user, isLoading: loadingUser } = useUserData();

  const { data: contractorData } = useQuery({
    queryKey: ['contractor-own', user?.email],
    queryFn: () => base44.entities.Contractor.filter({ email: user.email }),
    enabled: !!user?.email && !section,
    staleTime: 10 * 60 * 1000,
    select: (data) => data?.[0],
  });
  const contractorName = contractorData?.name || '';

  // Redirect section params to Business Hub
  useEffect(() => {
    if (section) {
      navigate('/ContractorBusinessHub?tab=' + section, { replace: true });
    }
  }, [section, navigate]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loadingUser && !user) {
      base44.auth.redirectToLogin();
    }
  }, [loadingUser, user]);

  if (section) return null; // redirecting

  return (
    <div style={{ minHeight: "100vh", background: "#EBEBEC", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1A1A1B", borderBottom: "1px solid #D0D0D2" }}>
        <AuthTopBar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#5C3500", boxShadow: "3px 3px 0px #F0E0C0", flexShrink: 0 }}>
              <HardHat style={{ width: 26, height: 26, color: "#F0E0C0" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "#fff", margin: 0 }}>
                Entrepreneur Portal
              </h1>
              <p style={{ color: "#aaa", margin: "3px 0 0", fontSize: 13, fontStyle: "italic" }}>
                {contractorName ? `Welcome back, ${contractorName}` : "Your central hub for all entrepreneur tools & pages"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {portalSections.map(section => (
          <div key={section.category} style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
              // {section.category}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    style={{ textAlign: "left", background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, padding: "18px 18px", boxShadow: "3px 3px 0px #5C3500", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "box-shadow 0.2s ease", width: "100%" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 14px 3px rgba(255,180,0,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "3px 3px 0px #5C3500"}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#1A1A1B" }}>
                      <Icon style={{ width: 20, height: 20, color: "#F0E0C0" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#1A1A1B", fontSize: 13 }}>{item.title}</span>
                        <ChevronRight style={{ width: 14, height: 14, color: "#999", flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.55, fontStyle: "italic", margin: "4px 0 0" }}>{item.description}</p>
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