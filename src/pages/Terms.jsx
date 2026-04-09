import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back to Home Button - Top */}
        <Link to="/" className="inline-block mb-8">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600">SurfCoast Marketplace</p>
          <p className="text-slate-500 text-sm mt-3">Last Updated: April 8, 2026</p>
          <p className="text-slate-500 text-sm mt-1">Effective Date: April 8, 2026</p>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Platform Liability Waiver</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            SurfCoast Marketplace ("Platform") is a connection platform only. By using this platform, all parties—contractors, customers, vendors, guests, and any other users—fully waive and release SurfCoast Marketplace and all of its officers, directors, employees, agents, and affiliates (collectively, "Platform Parties") from any and all claims, demands, causes of action, damages, injuries, illness, sickness, or death arising from or related to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Any services rendered or products sold through the platform</li>
            <li>Any interactions, transactions, or disputes between users</li>
            <li>Any injury, illness, sickness, or death occurring during or after a transaction</li>
            <li>Any quality, safety, or legality issues with services or products</li>
            <li>Any failure of Platform Parties to prevent, warn of, or resolve any of the above</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            Platform Parties make no representations, warranties, or guarantees regarding the quality, safety, legality, or credentials of any contractor, vendor, or service. Users assume all risk when using this platform.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Independent Contractor Status</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            All service providers (contractors, vendors, professionals, and others) using SurfCoast Marketplace are independent operators. They are not employees, agents, or representatives of SurfCoast Marketplace. The platform is not responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Compliance with employment laws or regulations</li>
            <li>Worker's compensation or benefits</li>
            <li>Tax obligations or filings</li>
            <li>Insurance or liability coverage</li>
            <li>Any legal or regulatory status of the service provider</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            Service providers are solely responsible for their legal status and all associated obligations.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-900 text-sm font-semibold mb-1">AB 5 Compliance Notice — Control of Work</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              SurfCoast Marketplace does not control, direct, or supervise the manner or means by which any service provider performs their work. Service providers independently determine their own schedules, methods, tools, and processes. SurfCoast Marketplace does not set hours of work, require specific work attire, provide equipment, or dictate how services are delivered. The platform provides only a technology marketplace to connect independent service providers with potential clients. This relationship is consistent with independent contractor status under California Labor Code and AB 5.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. No Verification or Endorsement</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            SurfCoast Marketplace does not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Verify, inspect, or certify the credentials, licenses, or qualifications of any contractor or vendor</li>
            <li>Endorse, recommend, or guarantee any service provider, product, or service</li>
            <li>Perform background checks, identity verification, or vetting of users</li>
            <li>Assume responsibility for the accuracy of any information provided by users</li>
            <li>Monitor, regulate, or control the conduct of any user</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            All information, profiles, reviews, and ratings on the platform are user-generated and unverified.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Contractor Terms</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Contractors using this platform are independent operators, not employees or agents of SurfCoast Marketplace. Contractors are solely responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Holding all required licenses, certifications, and insurance</li>
            <li>Complying with all applicable federal, state, and local laws</li>
            <li>The quality, safety, and legality of all services rendered</li>
            <li>Collecting and remitting applicable taxes</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace makes no guarantee regarding the accuracy of any contractor's credentials, licensing status, or work quality.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Farmers Market & Swap Meet Vendor Terms</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            All market vendors ("Vendors") operating through SurfCoast Marketplace are independent operators. Vendors are solely responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Obtaining all required local permits, business licenses, health department approvals, and event-specific vendor credentials</li>
            <li>Complying with all federal regulations including but not limited to FDA food safety rules, FTC regulations, and consumer protection laws</li>
            <li>Complying with all applicable state laws including cottage food laws, sales tax collection, and resale permit requirement</li>
            <li>Complying with all local city and county ordinances governing the sale of goods at markets and swap meets</li>
            <li>The safety, quality, labeling, and legality of all products and food items sold</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace does not inspect, certify, or guarantee any vendor's products, food items, or compliance status.
          </p>
        </div>

        {/* Section 6 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Customer & Guest Terms</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Customers and guests using SurfCoast Marketplace to find contractors or vendors are solely responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Independently researching, vetting, and verifying all contractors and vendors before engaging their services or purchasing products</li>
            <li>Making their own informed decisions regarding all transactions</li>
            <li>Understanding that reviews and ratings on this platform are user-generated and not verified by SurfCoast Marketplace</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace strongly encourages all customers to verify licenses, read reviews, ask questions, and exercise due diligence before any transaction.
          </p>
        </div>

        {/* Section 7 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Food Safety Disclaimer</h2>
          <p className="text-slate-700 leading-relaxed">
            Any food or beverage products sold through vendors on this platform have not been inspected or certified by SurfCoast Marketplace. Customers with food allergies, dietary restrictions, or health conditions assume all risk when purchasing food items. SurfCoast Marketplace is not responsible for any illness, allergic reaction, injury, or death related to food or beverage consumption.
          </p>
        </div>

        {/* Section 8 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Dispute Resolution</h2>
          <p className="text-slate-700 leading-relaxed">
            All disputes between users (customer-contractor, customer-vendor, or otherwise) are solely between the parties involved. SurfCoast Marketplace is not a party to any dispute and has no obligation to mediate, arbitrate, or resolve any disagreement. Users agree to resolve disputes directly and to hold Platform Parties harmless from any such dispute.
          </p>
        </div>

        {/* Section 9 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Governing Law</h2>
          <p className="text-slate-700 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any legal action arising from these Terms must be brought in a court of competent jurisdiction in San Diego County, California.
          </p>
        </div>

        {/* Section 10 - Pricing & Service Costs */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Pricing & Service Costs</h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            SurfCoast Marketplace offers various premium services and tools to enhance your experience on the platform. Below is a detailed breakdown of all available services, their costs, and how they work.
          </p>

          {/* WAVE FO Plans */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">WAVE FO Plans — Contractor Field Operations</h3>
            <p className="text-slate-700 mb-4">
              WAVE FO is SurfCoast's field operations ecosystem — a tiered set of tools built specifically for contractors and independent workers. All plans include a 2-week free trial. Month-to-month, cancel anytime.
            </p>

            {/* WAVE Starter */}
            <div className="mb-6 pl-4 border-l-4 border-slate-300">
              <h4 className="font-semibold text-slate-900 mb-2">WAVE Starter — $19.00/month</h4>
              <p className="text-sm text-slate-700 mb-2">The perfect entry point for independent professionals just getting started.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Public contractor profile with photo & bio</li>
                <li>Up to 5 active job postings</li>
                <li>Basic client messaging</li>
                <li>Quote request management</li>
                <li>Job scheduling calendar</li>
                <li>Mobile app access</li>
                <li>Standard customer reviews</li>
                <li>Email notifications</li>
                <li>Basic analytics dashboard</li>
              </ul>
            </div>

            {/* WAVE Pro */}
            <div className="mb-6 pl-4 border-l-4 border-blue-300">
              <h4 className="font-semibold text-slate-900 mb-2">WAVE Pro — $39.00/month</h4>
              <p className="text-sm text-slate-700 mb-2">For contractors who are ready to scale with CRM tools and expanded job capacity.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Everything in WAVE Starter</li>
                <li>Unlimited job postings</li>
                <li>Client Relationship Manager (CRM)</li>
                <li>Invoice generation & PDF export</li>
                <li>Scope of Work builder</li>
                <li>After-photo documentation</li>
                <li>Project milestone tracking</li>
                <li>Priority search placement</li>
                <li>Custom service packages</li>
                <li>Performance analytics</li>
                <li>Referral tracking</li>
                <li>Team collaboration tools</li>
              </ul>
            </div>

            {/* WAVE Max */}
            <div className="mb-6 pl-4 border-l-4 border-amber-300">
              <h4 className="font-semibold text-slate-900 mb-2">WAVE Max — $59.00/month (Most Popular)</h4>
              <p className="text-sm text-slate-700 mb-2">For serious operators who need field operations, GPS tracking, and compliance tools.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Everything in WAVE Pro</li>
                <li>GPS-based job tracking</li>
                <li>Field operations mobile suite</li>
                <li>Document management hub</li>
                <li>Multi-option client proposals</li>
                <li>Escrow payment support</li>
                <li>Project file sharing with clients</li>
                <li>Progress payment phases</li>
                <li>Contractor compliance tools</li>
                <li>Real-time availability manager</li>
                <li>Advanced scheduling assistant</li>
                <li>QuickBooks CSV export</li>
                <li>Custom invoice branding</li>
              </ul>
            </div>

            {/* WAVE FO Premium */}
            <div className="mb-6 pl-4 border-l-4 border-green-300">
              <h4 className="font-semibold text-slate-900 mb-2">WAVE FO Premium — $100.00/month (Licensed Sole Proprietors / HIS Verified)</h4>
              <p className="text-sm text-slate-700 mb-2">The full suite for licensed professionals — AI tools, integrations, and advanced compliance.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Everything in WAVE Max</li>
                <li>AI scheduling assistant</li>
                <li>AI bio & proposal generator</li>
                <li>HubSpot CRM sync</li>
                <li>Notion project page integration</li>
                <li>Campaign management tools</li>
                <li>Case study builder</li>
                <li>Contractor leaderboard & trade games</li>
                <li>Full audit trail & activity log</li>
                <li>Advanced job pipeline views</li>
                <li>Residential Wave invoicing suite</li>
                <li>Priority support</li>
              </ul>
            </div>

            {/* WAVE Residential Bundle */}
            <div className="pl-4 border-l-4 border-pink-300">
              <h4 className="font-semibold text-slate-900 mb-2">WAVE Residential Bundle — $125.00/month (All-In)</h4>
              <p className="text-sm text-slate-700 mb-2">Combines WAVE FO Premium with the full Residential Wave invoicing suite — everything from lead capture to final invoice, under one subscription.</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Everything in WAVE FO Premium</li>
                <li>Residential Wave lead management</li>
                <li>Residential Wave job tracking</li>
                <li>Residential Wave invoice management</li>
                <li>Bundle-exclusive document templates</li>
                <li>Revenue tracking & bundle reports</li>
                <li>White-label invoice option</li>
                <li>Early access to new features</li>
                <li>Full platform access — no add-ons needed</li>
              </ul>
            </div>
          </div>

          {/* WAVEShop */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">WAVEShop — Market Booths & Vendor Spaces — $35.00/month</h3>
            <p className="text-slate-700 mb-3">
              For farmers market and swap meet vendors who want a professional booth presence. Flat-rate subscription with zero commissions on any sales — ever.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">Included Features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Public booth/shop profile page</li>
                <li>Product listings with photos & prices</li>
                <li>Inventory tracking</li>
                <li>Customer reviews & ratings</li>
                <li>Farmers market & swap meet directory listing</li>
                <li>Booth schedule management</li>
                <li>Analytics dashboard</li>
                <li>Vendor inquiry inbox</li>
                <li>Marketing toolkit</li>
                <li>Social media link integration</li>
                <li>Photo gallery (up to 20 images)</li>
                <li>Zero commission on all sales</li>
                <li>Mobile-optimized dashboard</li>
              </ul>
            </div>
          </div>

          {/* Limited Communication */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Limited Communication — $1.50 (one-time)</h3>
            <p className="text-slate-700 mb-3">
              Send a single message to another platform user (contractor, vendor, or customer) to initiate contact.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">What's Included:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>One initial message to the recipient</li>
                <li>Basic message delivery and read receipt</li>
                <li>No ongoing conversation thread</li>
              </ul>
            </div>
          </div>

          {/* Quote Request */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Quote Request (No Additional Communication) — $1.75 (one-time)</h3>
            <p className="text-slate-700 mb-3">
              <strong>For Clients Only:</strong> Request a quote from a contractor for a specific project or job.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">What's Included:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Submission of your project details to the contractor</li>
                <li>The contractor receives your quote request</li>
                <li>Limited to quote response only (no ongoing conversation)</li>
                <li>You receive the contractor's pricing and availability estimate</li>
              </ul>
            </div>
          </div>

          {/* Subscription Communication */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Subscription Communication — $50.00/month</h3>
            <p className="text-slate-700 mb-3">
              Unlimited messaging and ongoing conversations with platform users for an entire month.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">What's Included:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Unlimited messages with any platform user</li>
                <li>Full conversation threads with all contacts</li>
                <li>File and photo attachments in messages</li>
                <li>Message search and history</li>
                <li>Read receipts and typing indicators</li>
                <li>Active for 30 days from purchase</li>
              </ul>
            </div>
          </div>

          {/* Summary Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100">
                    <th className="text-left p-3 font-semibold text-slate-900">Service</th>
                    <th className="text-left p-3 font-semibold text-slate-900">Cost</th>
                    <th className="text-left p-3 font-semibold text-slate-900">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">WAVE Starter</td>
                    <td className="p-3 text-slate-700">$19/month</td>
                    <td className="p-3 text-slate-700">New contractors getting started</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">WAVE Pro</td>
                    <td className="p-3 text-slate-700">$39/month</td>
                    <td className="p-3 text-slate-700">Growing contractors ready to scale</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">WAVE Max</td>
                    <td className="p-3 text-slate-700">$59/month</td>
                    <td className="p-3 text-slate-700">Established contractors with field operations needs</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">WAVE FO Premium</td>
                    <td className="p-3 text-slate-700">$100/month</td>
                    <td className="p-3 text-slate-700">Licensed sole proprietors (HIS verified)</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">WAVE Residential Bundle</td>
                    <td className="p-3 text-slate-700">$125/month</td>
                    <td className="p-3 text-slate-700">Licensed operators who want the full platform</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">WAVEShop Vendor</td>
                    <td className="p-3 text-slate-700">$35/month</td>
                    <td className="p-3 text-slate-700">Farmers market & swap meet vendors</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">Limited Communication</td>
                    <td className="p-3 text-slate-700">$1.50</td>
                    <td className="p-3 text-slate-700">One-time contact inquiry</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">Quote Request</td>
                    <td className="p-3 text-slate-700">$1.75</td>
                    <td className="p-3 text-slate-700">Request contractor quote (clients only)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-700">Subscription Communication</td>
                    <td className="p-3 text-slate-700">$50/month</td>
                    <td className="p-3 text-slate-700">Unlimited monthly messaging</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 11 - Platform Technology Fee */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Platform Technology & Facilitation Fee</h2>

          {/* CSLB-critical framing notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 text-sm font-semibold mb-1">Important — Nature of This Fee</p>
            <p className="text-blue-800 text-sm leading-relaxed">
              The fee described below is a <strong>technology and platform services fee</strong> charged by SurfCoast Marketplace for providing its software infrastructure, payment processing, identity verification, dispute tools, and marketplace access. It is <strong>not</strong> a commission on construction work, a contractor's license fee, or a payment for labor or materials. SurfCoast Marketplace does not perform, direct, supervise, or subcontract any work. All contracts for services are entered into directly between the client and the independent service provider.
            </p>
          </div>

          <h3 className="font-semibold text-slate-900 mb-3">Contractor Platform Technology Fee — 18% (Flat Rate)</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            When a job is completed and payment is processed through SurfCoast Marketplace, an <strong>18% platform technology and facilitation fee</strong> is deducted from the total job amount prior to payout. This fee is consistent for all contractors and covers:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Stripe payment processing and secure transaction infrastructure</li>
            <li>Identity verification and license document storage</li>
            <li>Dispute resolution tooling and case management</li>
            <li>Review verification and fraud prevention</li>
            <li>Marketplace platform access and software services</li>
          </ul>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-slate-800 text-sm font-semibold mb-2">Fee Example:</p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>Job Total agreed between client and contractor: <strong>$1,000.00</strong></li>
              <li>Platform Technology Fee (18%): <strong>-$180.00</strong></li>
              <li>Contractor Payout: <strong>$820.00</strong></li>
            </ul>
            <p className="text-xs text-slate-500 mt-3 italic">The contractor sets their own rate. The 18% fee is disclosed to both parties before the Scope of Work is approved.</p>
          </div>

          <h3 className="font-semibold text-slate-900 mb-3">Farmers Market & Swap Meet Vendors (WAVEShop)</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li><strong>Subscription Model:</strong> $35/month flat fee — zero commission on any sales processed.</li>
            <li><strong>Facilitation Fee Model:</strong> 5% platform technology fee on transactions processed through the platform. Example: a $100 sale results in a $95 payout to the vendor.</li>
          </ul>

          <p className="text-slate-700 leading-relaxed text-sm italic">
            SurfCoast Marketplace and all associates hold no responsibility for any outcomes, disputes, or damages arising from transactions between users. All users engage entirely at their own risk and are solely liable for their agreements with one another.
          </p>
        </div>

        {/* Section 12 - Modifications */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Modifications</h2>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace reserves the right to update these Terms at any time. Continued use of the platform after any update constitutes acceptance of the revised Terms. Users are encouraged to review this page periodically.
          </p>
        </div>

        {/* Section 13 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact</h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            For questions regarding these Terms of Service, contact us at:
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-slate-800 font-semibold">SurfCoast Marketplace — Legal</p>
            <p className="text-slate-700 mt-1">Email: <a href="mailto:privacy@surfcoastcmp.com" className="text-blue-600 underline font-semibold">privacy@surfcoastcmp.com</a></p>
          </div>
        </div>

        {/* Final Acknowledgment */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border-l-4 border-blue-600">
          <p className="text-slate-900 font-semibold leading-relaxed">
            By using SurfCoast Marketplace, you acknowledge that you have read, understood, and agreed to these Terms of Service in full.
          </p>
        </div>

        {/* Back to Home Button - Bottom */}
        <Link to="/" className="block text-center">
          <Button variant="outline" className="gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}