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
      title: 'Getting Started as an Entrepreneur',
      sections: [
        {
          id: '1.1',
          title: 'Your Personal Profile – The Foundation of Your Business',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Feature</h4>
                <p className="text-slate-600">Comprehensive profile where you showcase your skills, certifications, and portfolio. Every entrepreneur gets a free Basic Profile — no credit card, no expiration, no trial.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Attract the right clients and jobs by highlighting your expertise. Builds trust and establishes your professional brand. Your profile stays live and searchable for as long as you want it.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Profile Editor:</strong> Update your bio, add photos, list services, and select your line of work.</li>
                  <li><strong>Credential Manager:</strong> Upload licenses, certifications, insurance documents, and bond documents for verification.</li>
                  <li><strong>Identity Verification:</strong> Upload a government-issued ID and face photo to establish trust with clients.</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <strong>Always Free:</strong> Your public listing, job request reception, basic inquiry responses, reviews & ratings, and mobile access are free forever. No credit card required.
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
      title: 'Managing Your Work in the Field',
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
                <p className="text-slate-600">Create and send professional invoices directly from your device. Automated invoice generation is available on WAVE OS Pro and above.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Benefit</h4>
                <p className="text-slate-600">Streamline your billing process, get paid faster, and maintain accurate financial records.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Invoice Builder:</strong> Generate detailed invoices for completed work.</li>
                  <li><strong>PDF Export:</strong> Provide clients with a professional PDF invoice. (WAVE OS Pro+)</li>
                  <li><strong>Custom Invoice Branding:</strong> Add your logo and contact info. (WAVE OS Max+)</li>
                  <li><strong>Residential Invoicing Suite:</strong> Full residential invoice management and tracking. (WAVE OS Premium only)</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: '4.2',
          title: 'Platform Fee & Payment Processing',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 font-semibold">
                ⚠️ All jobs completed through SurfCoast are subject to an <strong>18% facilitation fee</strong>. This is automatically collected via Stripe. You receive <strong>82%</strong> directly to your connected bank account.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How It Works</h4>
                <p className="text-slate-600">When a client pays for a completed job through the platform, SurfCoast automatically collects the 18% facilitation fee via Stripe. The remaining 82% is sent directly to your Stripe Connect account and deposited to your bank.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What the Fee Covers</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Payment processing infrastructure (Stripe)</li>
                  <li>Dispute protection and resolution support</li>
                  <li>Platform compliance and insurance framework</li>
                  <li>Documentation and audit trail for every job</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tools</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Stripe Connect:</strong> Securely link your bank account to receive payouts.</li>
                  <li><strong>Payment Tracking:</strong> Monitor invoice and payment status in real time.</li>
                  <li><strong>Escrow Support:</strong> Milestone-based payment hold and release. (WAVE OS Max+)</li>
                </ul>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <strong>Important:</strong> Accepting or requesting payment outside of SurfCoast violates platform policy and can result in immediate account suspension. All transactions must flow through the platform.
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
                  <li><strong>Earnings Reports:</strong> Summarize your income over various periods. (WAVE OS Pro+)</li>
                  <li><strong>Analytics Dashboard:</strong> Performance stats across jobs, ratings, and earnings. (WAVE OS Pro+)</li>
                  <li><strong>QuickBooks CSV Export:</strong> Transfer your financial data for accounting. (WAVE OS Max+)</li>
                  <li><strong>Payout Breakdown:</strong> See the 18% fee and your 82% net payout per job.</li>
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
      id: 8,
      title: 'Suggest a Tool – Shape the Platform',
      sections: [
        {
          id: '8.1',
          title: 'Your Voice Builds the Platform',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🆕 Added April 8, 2026 — New feature live during entrepreneur signup.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">When you sign up as an entrepreneur, you'll see a suggestion box on the Professional Details step of onboarding. After you select your line of work, a field appears asking if there's a specific online tool, software, or service that would help you work better in your field.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why It Exists</h4>
                <p className="text-slate-600">SurfCoast is built by people who've worked in the trades and know what the industry actually needs. The tool suggestion system lets the platform grow based on real input from real professionals — not guesswork. Every suggestion is read by AI and contributes to a running count of what the entrepreneur community is actually asking for.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What to Write</h4>
                <p className="text-slate-600">You'll get the best results by describing the tool in full sentences — what it's called, what it does, how it changes the way you work, and why others in your field would benefit from it. The more specific and honest you are, the more weight your suggestion carries in the system.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Is It Required?</h4>
                <p className="text-slate-600">No. The suggestion box is entirely optional. If nothing comes to mind during signup, skip it — you can always reach out to the platform through the feedback channel later.</p>
              </div>
            </div>
          ),
        },
        {
          id: '8.2',
          title: 'How AI Evaluates Your Suggestion',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What the AI Extracts</h4>
                <p className="text-slate-600 mb-3">Every suggestion is automatically processed by AI, which looks for the following information in your response:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li><strong>Tool Name:</strong> The specific name of the product, software, or service you're describing.</li>
                  <li><strong>Field of Work:</strong> Which line of work or profession this tool is most relevant to.</li>
                  <li><strong>Skill Level:</strong> Whether this applies to apprentices, novices, experienced professionals, experts, or all levels.</li>
                  <li><strong>Function:</strong> What the tool actually does — its core purpose in plain terms.</li>
                  <li><strong>Impact:</strong> How this tool enhances or fundamentally changes the way work is done.</li>
                  <li><strong>Adoption Likelihood:</strong> How likely others in the field are to actually use it (Low / Medium / High / Very High).</li>
                  <li><strong>Alternatives:</strong> Similar tools or competing products that were also mentioned.</li>
                  <li><strong>Perceived Value:</strong> A rating of the tool's importance — Fair, Good, Great, or Amazing.</li>
                  <li><strong>Legitimacy Score:</strong> A 1–10 score evaluating whether this appears to be a genuine professional tool request vs. a personal want.</li>
                </ul>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Note:</strong> The legitimacy score is not a judgment against you — it's a quality filter that helps the platform distinguish between widely-needed professional tools and one-off personal preferences. A score of 8–10 means your suggestion is clearly a real industry need. Even low scores are stored and tracked — multiple low-score mentions of the same tool still count.
              </div>
            </div>
          ),
        },
        {
          id: '8.3',
          title: 'The 100-Mention Threshold',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How Counts Work</h4>
                <p className="text-slate-600">Every unique tool is tracked by name and by field. Each time a new entrepreneur mentions the same tool for the same line of work, the mention count increases by one — regardless of whether it's an identical suggestion or worded completely differently. The AI normalizes tool names so "Jobber," "Jobber App," and "jobber.com" all count toward the same total.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens at 100</h4>
                <p className="text-slate-600">When a tool reaches 100 unique mentions for a specific field, an automated notification is sent to the platform administrator. The notification includes:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mt-2">
                  <li>The tool name and the field it belongs to.</li>
                  <li>A summary of what the tool does and how it changes work.</li>
                  <li>The full breakdown of skill levels, perceived value ratings, and adoption likelihood across all 100 mentions.</li>
                  <li>A list of alternative/competing tools mentioned alongside it.</li>
                  <li>The average legitimacy score across all submissions.</li>
                  <li>Up to 5 real sample quotes from actual entrepreneur submissions.</li>
                  <li>Five platform-level questions the admin should consider — such as whether to integrate it natively, partner with the company, or recommend it externally.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens Next</h4>
                <p className="text-slate-600">At that point, it becomes the platform's responsibility to evaluate the tool and determine whether to integrate it, build a native equivalent, create a partner referral, or simply recommend it to users in the relevant field. The entrepreneur community drives this — you are directly shaping what this platform becomes.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 12,
      title: 'Platform Enhancements – April 9, 2026',
      sections: [
        {
          id: '12.1',
          title: 'Sun Glare & Thumbs Interface – Field-First UI',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🆕 Deployed April 9, 2026 — Field operations action buttons redesigned for one-handed outdoor use.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Changed</h4>
                <p className="text-slate-600">The job action buttons inside WAVE OS (Add Photos, Capture Location, Job Notes, Get Signature, Mark Complete, Share/Message) have been redesigned with larger touch targets — minimum 80px tall — and bolder text. Active state is now visually distinct with a white border highlight so you always know what's selected, even in direct sunlight.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why It Matters</h4>
                <p className="text-slate-600">Contractors work with one hand, sometimes with gloves, and often under direct sunlight. Small buttons and thin text fail in these conditions. This update prioritizes the physical reality of field work — your app should be as easy to use on a roof as it is at a desk.</p>
              </div>
            </div>
          ),
        },
        {
          id: '12.2',
          title: 'Offline Status Bar – Real-Time Connectivity Feedback',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🆕 Deployed April 9, 2026 — Live connectivity indicator now active in WAVE OS.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">A persistent status bar appears at the top of WAVE OS whenever your connection drops. It shows a clear red banner reading "Offline — job data cached locally" so you always know your current connectivity state.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">When You Reconnect</h4>
                <p className="text-slate-600">The moment your phone reconnects, the bar turns green and shows "Back online" with a "Sync Now" button if there are pending items queued from offline work. This auto-dismisses after a few seconds once sync is confirmed.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why It Matters</h4>
                <p className="text-slate-600">Dead zones are a reality — concrete basements, remote properties, and rural job sites all have connectivity gaps. You should never wonder whether the app is working or your network is down. This bar eliminates that uncertainty.</p>
              </div>
            </div>
          ),
        },
        {
          id: '12.3',
          title: 'AI Business Insights – Personalized Recommendations',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 font-medium">
                🆕 Deployed April 9, 2026 — AI-powered business insights now live on the Contractor Business Hub dashboard.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">A new "AI Business Insights" panel sits at the top of your Business Hub dashboard. Click "Generate" and the system analyzes your actual data — completed jobs, rating, earnings, active scopes, availability status, location, and trade — and returns 3 specific, actionable recommendations.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Kind of Insights</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Pricing Strategy:</strong> Based on your completed job count and earnings, the AI may suggest adjusting your rate.</li>
                  <li><strong>Lead Generation Timing:</strong> Based on your availability and active scopes, suggestions on when to push for new work.</li>
                  <li><strong>Profile Optimization:</strong> Specific improvements to your public profile that could increase booking rates.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How to Use It</h4>
                <p className="text-slate-600">Navigate to Contractor Business Hub → Dashboard tab. Click "Generate" on the AI Business Insights card. Results appear in seconds. Click "Refresh" any time to regenerate based on your latest data.</p>
              </div>
            </div>
          ),
        },
        {
          id: '12.4',
          title: 'Real-Time Project Messaging – Live Inside Active Scopes',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🆕 Deployed April 9, 2026 — Real-time messaging now embedded directly in the Scopes tab for all approved jobs.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">Every approved scope of work now has a live project message thread embedded directly below the milestones section. Messages appear instantly — no page refresh needed. A green "Live" indicator confirms the connection is active.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How It Works</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Messages are scoped to the specific job — only contractor and client see them.</li>
                  <li>New messages from the other party appear automatically via real-time subscription.</li>
                  <li>Unread messages are marked as read the moment you view the thread.</li>
                  <li>Press Enter to send — or use the send button.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Where to Find It</h4>
                <p className="text-slate-600">Business Hub → Jobs & Projects → Scopes tab → expand any approved scope → scroll below milestones.</p>
              </div>
            </div>
          ),
        },
        {
          id: '12.5',
          title: 'Compliance Expiry Monitor – Proactive Document Alerts',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                🆕 Deployed April 9, 2026 — Automated expiry alerts now active in the Documents tab.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">A Compliance Expiry Monitor now sits at the top of your Documents tab. It automatically reads your insurance expiry, contractor license expiry, bond expiry, and any additional certification expiry dates — and color-codes them based on urgency.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Color-Coded Alert System</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong className="text-red-600">Red — Expired:</strong> Document has already passed its expiration date. Action required immediately.</li>
                  <li><strong className="text-amber-600">Amber — Urgent (within 30 days):</strong> Expiring very soon. Renew now.</li>
                  <li><strong className="text-yellow-600">Yellow — Warning (31–60 days):</strong> Approaching expiration. Plan your renewal.</li>
                  <li><strong className="text-green-600">Green — Current:</strong> Document is valid with plenty of time remaining.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why It Matters</h4>
                <p className="text-slate-600">An expired insurance policy or contractor license can disqualify you from accepting jobs on the platform — and in some states, expose you to legal liability. This monitor ensures you're never caught off guard by a lapsed document.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Where to Find It</h4>
                <p className="text-slate-600">Business Hub → Profile & Credentials → Documents tab → top of page.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 9,
      title: 'Platform Updates – April 9, 2026',
      sections: [
        {
          id: '9.1',
          title: 'Privacy Contact Email Updated',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🆕 Updated April 9, 2026 — Official privacy contact email updated across the platform.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Changed</h4>
                <p className="text-slate-600">The platform's official privacy contact email has been updated from <code className="bg-slate-100 px-1 rounded text-sm">privacy@surfcoastmarketplace.com</code> to <strong>privacy@surfcoastcmp.com</strong>. This new address is hosted through Google Workspace on the officially owned domain <code className="bg-slate-100 px-1 rounded text-sm">surfcoastcmp.com</code>.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Where This Applies</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Privacy Policy page</strong> — all CCPA/CPRA request links and contact references.</li>
                  <li><strong>Terms of Service page</strong> — legal contact references.</li>
                  <li><strong>Footer</strong> — the "Do Not Sell My Info" link.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">For Users</h4>
                <p className="text-slate-600">If you need to submit a privacy request, exercise your CCPA/CPRA rights, or contact the platform's privacy team, use:</p>
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <a href="mailto:privacy@surfcoastcmp.com" className="text-blue-600 font-semibold underline">privacy@surfcoastcmp.com</a>
                  <p className="text-slate-500 text-sm mt-1">Responses provided within 45 days as required by CCPA/CPRA.</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: '9.2',
          title: 'AB 5 Independent Contractor Clarification (April 9, 2026)',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                🆕 Updated April 9, 2026 — Terms of Service Section 2 strengthened for California AB 5 compliance.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Changed</h4>
                <p className="text-slate-600">Section 2 of the Terms of Service has been updated to include an explicit AB 5 compliance notice addressing California's strict worker classification law. The new language makes clear that SurfCoast Marketplace does not control, direct, or supervise the manner or means by which any service provider performs their work.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What This Means for You</h4>
                <p className="text-slate-600">As an independent contractor on SurfCoast, California law requires that the platform not exercise "control" over how you do your work. This update formally documents that:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                  <li>You set your own schedule, methods, tools, and process.</li>
                  <li>SurfCoast does not require specific work attire or hours.</li>
                  <li>SurfCoast does not provide your equipment.</li>
                  <li>SurfCoast does not dictate how your services are delivered.</li>
                  <li>You are operating as a genuinely independent service provider.</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Why It Matters:</strong> The California Contractors State License Board (CSLB) and the EDD look for explicit language confirming platforms do not control work performance. This update protects both you and SurfCoast from misclassification risk under AB 5.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">No Action Required from You</h4>
                <p className="text-slate-600">This is a platform-side legal update. Continued use of SurfCoast Marketplace constitutes acceptance of the updated Terms. You can review the full updated Terms of Service at any time via the footer link.</p>
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
          id: '5.0',
          title: 'Free Basic Profile – Always Free, No Card Required',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">Every professional on SurfCoast gets a free public profile — no credit card, no expiration, no trial. Your profile stays live and searchable for as long as you want it.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What's Included (Free Forever)</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Public listing and discovery</li>
                  <li>Receive job requests from clients</li>
                  <li>Basic inquiry responses</li>
                  <li>Reviews and ratings</li>
                  <li>Mobile access</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <strong>Note:</strong> Communication sessions still cost $1.50 per 10-minute session (or $50/month for unlimited) when you're ready to connect with a potential client. The profile itself is always free.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">WAVE OS is Optional</h4>
                <p className="text-slate-600">WAVE OS subscriptions (Starter, Pro, Max, Premium) are optional upgrades that unlock additional tools, but you are never required to subscribe to maintain a live profile on the platform.</p>
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
    {
      id: 10,
      title: 'Trial, Founding Members & Referrals',
      sections: [
        {
          id: '10.1',
          title: 'Founding 100 – One Full Year Free',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                🌟 First 100 signups only — no credit card, no conditions.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">The first 100 contractors and vendors to sign up on SurfCoast receive one full year of all-access platform use at no cost. No credit card required. No auto-charge at the end. No conditions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Who Qualifies</h4>
                <p className="text-slate-600">The Founding 100 spots are filled on a first-come, first-served basis across all user types — contractors, market shop vendors, and consumers combined.</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Important:</strong> Founding 100 members do NOT participate in the 5-for-1 referral loop — they already have their full year free and cannot extend it further through referrals.
              </div>
            </div>
          ),
        },
        {
          id: '10.2',
          title: 'Standard 14-Day Free Trial',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What It Is</h4>
                <p className="text-slate-600">After the Founding 100 spots are filled, every new signup receives a <strong>14-day free trial</strong> with full platform access. No auto-charges at the end of the trial — you choose whether to subscribe.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What's Included</h4>
                <p className="text-slate-600">Full access to all platform features during the trial window — the same access as a paid subscriber. No restricted features, no paywalls during your trial.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">After the Trial</h4>
                <p className="text-slate-600">At the end of your 14-day trial, your account remains active on the free Basic Profile tier unless you choose to subscribe to a WAVE OS plan.</p>
              </div>
            </div>
          ),
        },
        {
          id: '10.3',
          title: 'The 5-for-1 Referral Loop – Extend Your Trial',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                ⚡ Only active during your 14-day trial window. Does not apply after trial expiry or for Founding 100 members.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">How It Works</h4>
                <p className="text-slate-600">During your active 14-day trial, you can earn <strong>1 additional free trial day</strong> for every 5 people you refer who successfully sign up on the platform. This loop is stackable — refer 10, earn 2 extra days; refer 50, earn 10 extra days.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Rules</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Referrals must be new, successful signups (not existing users).</li>
                  <li>The loop only operates while your trial is still active.</li>
                  <li>Once the trial expires, referrals no longer extend access.</li>
                  <li>Founding 100 members are not eligible — they already have a full year free.</li>
                </ul>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                <strong>Example:</strong> You sign up, get 14 days free. You refer 15 people during that window. That earns you 3 extra days (15 ÷ 5 = 3), extending your trial to 17 days total.
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 11,
      title: 'Client Pricing – What Clients Pay',
      sections: [
        {
          id: '11.1',
          title: 'How Clients Connect with Contractors',
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Browsing is Always Free</h4>
                <p className="text-slate-600">Clients can browse all contractor profiles, view portfolios, read reviews, and compare options at no cost. No account required to browse.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Direct Messaging — $1.50 per 10-minute session</h4>
                <p className="text-slate-600">To initiate a direct conversation with a contractor, clients pay $1.50 for a 10-minute timed session. Alternatively, clients can subscribe to the $50/month unlimited messaging plan to communicate with multiple contractors without per-session fees.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Proposal Requests — $1.75 (one-time per contractor)</h4>
                <p className="text-slate-600">Clients can send a detailed project proposal request to a specific contractor for $1.75. This delivers the client's project details, budget, and timeline directly to the contractor's inbox. The contractor responds with their estimate — no additional charge to the client.</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <strong>For Contractors:</strong> Responding to a client's proposal request is always free. Contractors are never charged to reply to inbound RFPs.
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Unlimited Messaging Plan — $50/month</h4>
                <p className="text-slate-600">Clients who need to communicate with multiple contractors regularly can subscribe to the $50/month unlimited messaging plan — full conversation threads with any contractor, no per-session fees.</p>
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
            <h1 className="text-4xl font-bold text-slate-900">The SurfCoast Contractors Marketplace Platform Handbook</h1>
          </div>
          <p className="text-lg font-semibold text-blue-600 tracking-wide">SCMP HANDBOOK</p>
          <p className="text-slate-500 mt-2">Your comprehensive guide to running a successful independent business with WAVE OS.</p>
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