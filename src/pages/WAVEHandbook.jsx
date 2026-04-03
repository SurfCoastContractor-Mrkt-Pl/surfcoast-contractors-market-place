import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

export default function WAVEHandbook() {
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [selectedSection, setSelectedSection] = useState('1.1');

  const chapters = [
    {
      id: 1,
      title: 'Getting Started with WAVE FO',
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
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Integrated messaging system that allows you to chat directly with clients via in-app messages or SMS.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Build strong client relationships, provide instant updates, and keep all communication organized in one place.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Unified Inbox:</strong> See all messages from a client in one conversation thread.</li>
                  <li><strong>SMS Integration:</strong> Send and receive text messages directly from the app.</li>
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
          <p className="text-slate-500 mt-2">Your comprehensive guide to running a successful contracting business with WAVE FO.</p>
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