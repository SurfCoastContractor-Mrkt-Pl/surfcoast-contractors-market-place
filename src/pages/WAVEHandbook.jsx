import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AboutWAVEOS from '@/components/WAVEHandbook/AboutWAVEOS';
import WAVEOSEcosystemOverview from '@/components/WAVEHandbook/WAVEOSEcosystemOverview';
import SubscriptionGate from '@/components/WAVEHandbook/SubscriptionGate';

export default function WAVEHandbook() {
  const navigate = useNavigate();
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [selectedSection, setSelectedSection] = useState('1.1');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        setIsSubscribed(false);
        setIsLoading(false);
        return;
      }

      // Check if user has a contractor profile with active subscription
      const contractors = await base44.entities.Contractor.filter({ email: user.email });
      // Check if user has a market shop
      const marketShops = await base44.entities.MarketShop.filter({ email: user.email });

      // If either exists, assume active subscription (in real implementation, check subscription status)
      setIsSubscribed((contractors && contractors.length > 0) || (marketShops && marketShops.length > 0));
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const chapters = [
    {
      id: 0,
      title: 'About WAVE OS',
      sections: [
        {
          id: '0.1',
          title: 'Our Mission & Values',
          content: <AboutWAVEOS />,
        },
      ],
    },
    {
      id: 6,
      title: 'WAVE OS Ecosystem Overview',
      sections: [
        {
          id: '6.1',
          title: 'Complete Tier & Pricing Breakdown',
          content: <WAVEOSEcosystemOverview />,
        },
      ],
    },
    {
      id: 1,
      title: 'Getting Started with WAVE OS',
      sections: [
        {
          id: '1.1',
          title: 'Your Personal Profile – The Foundation of Your Business',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Comprehensive profile where you showcase your skills, certifications, and portfolio.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Attract the right clients and jobs by highlighting your expertise. Builds trust and establishes your professional brand.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Profile Editor:</strong> Update your bio, add photos, list services.</li>
                  <li><strong>Credential Manager:</strong> Upload licenses, certifications, and insurance documents for verification.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '1.2',
          title: 'Setting Up Your Availability – Work When You Want',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Flexible calendar management and availability settings.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Take control of your work-life balance. Only receive job inquiries and get scheduled for work when you're genuinely available.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Availability Calendar:</strong> Block out personal time, vacations, or set recurring unavailable periods.</li>
                  <li><strong>Status Toggler:</strong> Instantly mark yourself as "Available," "Booked," or "On Break."</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 2,
      title: 'Managing Your Work – Efficiency in Your Pocket',
      sections: [
        {
          id: '2.1',
          title: 'My Day View – Your Daily Operational Hub',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">A personalized dashboard showing all your scheduled jobs, leads, and appointments.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">See your entire workday at a glance. Stay organized and never miss a beat.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Job Cards:</strong> Quick access to job details, client contact, and navigation.</li>
                  <li><strong>Lead Manager:</strong> Review and accept new job opportunities or inquiries.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '2.2',
          title: 'Intelligent Routing – Maximize Your Time',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Map integration that optimizes your daily travel.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Save time, reduce fuel costs, and fit more jobs into your day by following the most efficient routes.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Route Optimizer:</strong> Generates the best sequence for your scheduled jobs.</li>
                  <li><strong>Turn-by-Turn Navigation:</strong> Direct integration with your preferred map app.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '2.3',
          title: 'Job Progress & Documentation – On-Site Control',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Tools to update job status, record notes, and capture essential job site photos.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Keep clients informed, protect yourself with documentation, and ensure accurate records for every job.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Status Updater:</strong> Mark jobs as "En Route," "On Site," "Job Complete."</li>
                  <li><strong>Photo Uploader:</strong> Capture "before" and "after" photos directly from your device's camera.</li>
                  <li><strong>Notes Field:</strong> Add important details or observations for your records.</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 3,
      title: 'Connecting with Clients – Your Direct Line',
      sections: [
        {
          id: '3.1',
          title: 'Two-Way Client Messaging – Clear & Consistent Communication',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                📅 Updated April 8, 2026 — Messaging policy updated. Residential Bundle removed.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Integrated messaging system that allows you to chat directly with clients via in-app messages or SMS.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Build strong client relationships, provide instant updates, and keep all communication organized in one place.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Messaging by Tier</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li><strong>Starter / Pro:</strong> $1.50 per 10-minute session, or $50/month for unlimited messaging.</li>
                  <li><strong>WAVE Max:</strong> Free messaging with <em>past clients only</em> — clients from previously closed jobs. New clients require a session fee or the $50/mo plan.</li>
                  <li><strong>WAVE Premium:</strong> Free messaging with <em>all clients</em> — no per-session fees, ever.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Unified Inbox:</strong> See all messages from a client in one conversation thread.</li>
                  <li><strong>SMS Integration:</strong> Send and receive text messages directly from the app.</li>
                  <li><strong>Timed Sessions:</strong> Pay-per-session access for Starter/Pro subscribers.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '3.2',
          title: 'Automated Notifications – Professionalism Made Easy',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Send automated, customizable updates to your clients regarding their job status.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Impress clients with proactive communication without needing to send manual updates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Notification Templates:</strong> Pre-set messages for "On My Way," "Job Started," "Job Completed."</li>
                  <li><strong>Client Communication Settings:</strong> Choose when and how your clients receive updates.</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 4,
      title: 'Money Matters – Getting Paid, Your Way',
      sections: [
        {
          id: '4.1',
          title: 'Invoice Generation – Professional & Prompt Billing',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Create and send professional invoices directly from your device.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Streamline your billing process, get paid faster, and maintain accurate financial records.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Invoice Builder:</strong> Generate detailed invoices for completed work.</li>
                  <li><strong>PDF Export:</strong> Provide clients with a professional PDF invoice.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '4.2',
          title: 'Payment Processing – Secure & Convenient',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Securely accept payments from clients via various methods.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Offer flexible payment options, reduce payment delays, and ensure you get paid for your hard work.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Stripe Integration:</strong> Process credit card and ACH payments.</li>
                  <li><strong>Payment Tracking:</strong> Monitor the status of your invoices and payments.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '4.3',
          title: 'Financial Overviews – Your Business at a Glance',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Dashboards and reports to track your earnings and job profitability.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Gain insights into your business performance to make smarter financial decisions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Earnings Reports:</strong> Summarize your income over various periods.</li>
                  <li><strong>QuickBooks Export:</strong> Easily transfer your financial data for accounting.</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 7,
      title: 'Job Completion & Account Compliance',
      sections: [
        {
          id: '7.1',
          title: 'Expected Completion Date – Your Job Deadline',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🆕 Added April 8, 2026 — New compliance system now active on all approved jobs.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">When a Scope of Work is created and approved, an <strong>Expected Completion Date</strong> is set. This is the agreed deadline by which the job must be fully closed out — meaning both the contractor and client have confirmed the job is done, after-photos are uploaded, and payment has been processed through the platform.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why It Exists</h4>
                <p className="text-slate-600">The platform monitors every active approved job. If a job passes its expected completion date without a proper closeout, the system automatically locks both the contractor's and client's accounts until the situation is resolved. This ensures every dollar flows through SurfCoast and no job goes undocumented.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens When a Job Is Overdue</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Both the <strong>contractor</strong> and the <strong>client</strong> have their accounts locked for non-platform activities.</li>
                  <li>Locked accounts can still access <strong>direct messaging</strong> with each other to resolve the situation.</li>
                  <li>All other platform features — posting jobs, accepting new work, making payments — are blocked until the overdue job is closed out.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How to Resolve It</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Complete the job closeout: both parties confirm, after-photos are uploaded, and payment is processed.</li>
                  <li>The moment the scope status changes to <strong>Closed</strong>, both accounts are automatically and instantly unlocked — no manual review needed.</li>
                  <li>You'll receive a confirmation email when your account is unlocked.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '7.2',
          title: 'Account Lock System – What It Means & How It Works',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Types of Account Locks</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li><strong>After-Photo Lock:</strong> Triggered 72 hours after the agreed work date if after-photos are missing. Lifts immediately when photos are uploaded.</li>
                  <li><strong>Rating Block:</strong> Triggered when a completed job has not received a mutual rating from both parties. Only the non-compliant party is blocked.</li>
                  <li><strong>Overdue Job Lock:</strong> Triggered when a job passes its expected completion date without being closed out. Locks both contractor and client accounts.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What You Can Still Do While Locked</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Message the other party directly to coordinate resolution.</li>
                  <li>Access your existing job documentation and scope details.</li>
                  <li>Upload after-photos or submit ratings to lift the relevant lock.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Is Blocked</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Accepting new jobs or posting new job listings.</li>
                  <li>Making new payments or processing new transactions.</li>
                  <li>Accessing non-essential platform features.</li>
                </ul>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Important:</strong> All account locks are fully automated. There is no manual review process — locks trigger instantly when conditions are met and lift instantly when resolved.
              </div>
            </div>
          ),
        },
        {
          id: '7.3',
          title: 'Billing Cycle & Account Deletion – What Happens If Unresolved',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-medium">
                ⚠️ This only applies to accounts that remain locked through the end of a billing cycle without resolution.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens</h4>
                <p className="text-slate-600">If a contractor's account remains locked for an overdue job and their billing cycle ends without the job being closed out, the platform initiates an automated account offboarding sequence:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mt-2">
                  <li>Payment card details are removed from the account.</li>
                  <li>The account is queued for permanent deletion.</li>
                  <li>Both the contractor and the platform admin are notified by email.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why This Policy Exists</h4>
                <p className="text-slate-600">SurfCoast cannot allow jobs to be completed off-platform. Every transaction must flow through the system to protect both the client and the contractor — as well as to maintain the integrity of the platform's insurance, dispute, and compliance systems.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How to Avoid This</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Always close out jobs on time through the platform.</li>
                  <li>If you need more time, communicate with your client and update the scope's expected completion date <strong>before</strong> the deadline passes.</li>
                  <li>Never accept or request payment outside of SurfCoast.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '7.4',
          title: 'One Active Job at a Time – How Job Locking Works',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Once a Scope of Work is approved, the contractor is marked as <strong>On Active Job</strong>. This prevents them from accepting additional scopes of work until the current job is closed out.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why This Exists</h4>
                <p className="text-slate-600">This ensures full commitment to each client, maintains quality, prevents double-booking, and keeps the platform's compliance systems accurate and enforceable.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Changes When the Job Closes</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>The <strong>On Active Job</strong> flag is automatically cleared.</li>
                  <li>Availability status resets to <strong>Available</strong>.</li>
                  <li>You can immediately begin accepting new scopes of work.</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 5,
      title: 'Tools for Growth – Expand Your Potential',
      sections: [
        {
          id: '5.1',
          title: 'Offline Mode – Work Anywhere, Anytime',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Access and manage your jobs even when you don't have an internet connection.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Never lose productivity, even in remote locations or basements. Your work continues uninterrupted.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Local Data Sync:</strong> Your job details are stored securely on your device.</li>
                  <li><strong>Offline Actions:</strong> Update job status, take photos, and add notes – all saved and synced automatically when you reconnect.</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '5.2',
          title: 'Inventory Management – Keep Track of Your Assets',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Manage your own tools, equipment, and materials.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Stay organized, ensure you have what you need for every job, and track your business assets.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Equipment List:</strong> Keep a digital inventory of your tools.</li>
                  <li><strong>Usage Tracker:</strong> Log which materials are used for each job.</li>
                </ul>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  const currentSection = chapters
    .flatMap(ch => ch.sections)
    .find(s => s.id === selectedSection);

  // Show loading spinner while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show gate if not subscribed
  if (!isSubscribed) {
    return <SubscriptionGate onSubscribe={() => navigate('/pricing')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">WAVE Handbook</h1>
          </div>
          <p className="text-lg text-slate-600">Master Your Trade, On Your Terms.</p>
          <p className="text-slate-500 mt-2">Your comprehensive guide to running a successful contracting business with WAVE OS.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-4">Chapters</h3>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div key={chapter.id}>
                    <button
                      onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                    >
                      <span className="font-medium text-slate-700 text-sm">{chapter.title}</span>
                      {expandedChapter === chapter.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {expandedChapter === chapter.id && (
                      <div className="ml-3 mt-2 space-y-1 border-l-2 border-slate-200 pl-3">
                        {chapter.sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedSection === section.id
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {section.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              {currentSection && (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">{currentSection.title}</h2>
                  <div className="text-slate-700 space-y-6">{currentSection.content}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}