import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back to Home Button - Top */}
        <Link to="/Landing" className="inline-block mb-8">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600">SurfCoast Marketplace</p>
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

          {/* Residential Wave */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Residential Wave Dashboard - $100.00/month</h3>
            <p className="text-slate-700 mb-3">
              A premium business management suite designed for trade-specific contractors. This subscription provides advanced tools for professional project and client management.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">Included Features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Job scheduling and management dashboard</li>
                <li>Lead tracking and pipeline management</li>
                <li>Professional invoice generation and management</li>
                <li>Document storage and organization (licenses, insurance, certifications)</li>
                <li>Client communication tools</li>
                <li>Project tracking and completion reporting</li>
              </ul>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              <strong>Target Audience:</strong> Trade-specific contractors in all construction and skilled trade specialties, including but not limited to: plumbing, HVAC, electrical, carpentry, masonry, roofing, painting, welding, tiling, landscaping, and other licensed trade professionals.
            </p>
            <p className="text-sm text-slate-600">
              <strong>How It Works:</strong> Subscribe to access the full Residential Wave dashboard. Your subscription renews automatically each month at $100. Cancel anytime from your account settings.
            </p>
          </div>

          {/* SurfCoast Vendor Listing */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">SurfCoast Vendor Listing - $100.00/month OR $35.00/month</h3>
            <p className="text-slate-700 mb-3">
              List your products and services on the SurfCoast Marketplace, reaching customers at farmers markets, swap meets, and other market events.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">Two Pricing Options:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                <li><strong>Premium Plan ($100/month):</strong> Unlimited product listings, featured vendor placement, advanced analytics, and priority customer support.</li>
                <li><strong>Basic Plan ($35/month):</strong> Up to 50 product listings, standard vendor placement, and basic analytics.</li>
              </ul>
            </div>
            <p className="text-sm text-slate-600">
              <strong>How It Works:</strong> Choose your preferred plan and pay monthly. Upload product photos, descriptions, and pricing. Your listings appear on the marketplace immediately. You receive notifications when customers express interest in your products.
            </p>
          </div>

          {/* Limited Communication */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Limited Communication - $1.50 (one-time)</h3>
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
            <p className="text-sm text-slate-600">
              <strong>How It Works:</strong> Pay $1.50 to send your first message to a contractor, vendor, or customer. This opens a limited communication window to introduce yourself or inquire about services. Further conversation may require a subscription communication plan.
            </p>
          </div>

          {/* Quote Request */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Quote Request (No Additional Communication) - $1.75 (one-time)</h3>
            <p className="text-slate-700 mb-3">
              Request a quote from a contractor for a specific project or job.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-2">What's Included:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                <li>Submission of your project details to the contractor</li>
                <li>The contractor receives your quote request</li>
                <li>Limited to quote response only (no ongoing conversation)</li>
              </ul>
            </div>
            <p className="text-sm text-slate-600">
              <strong>How It Works:</strong> Pay $1.75 to submit your project details to a contractor for a quote. The contractor reviews your request and may respond with pricing and availability. This fee covers request submission only; additional communication requires a subscription plan.
            </p>
          </div>

          {/* Subscription Communication */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Subscription Communication - $50.00/month</h3>
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
            <p className="text-sm text-slate-600">
              <strong>How It Works:</strong> Subscribe for $50/month to unlock unlimited messaging with all platform users. Send and receive unlimited messages, build ongoing conversations with multiple contractors or customers, and collaborate on projects. Your subscription renews automatically each month.
            </p>
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
                    <td className="p-3 text-slate-700">Residential Wave</td>
                    <td className="p-3 text-slate-700">$100/month</td>
                    <td className="p-3 text-slate-700">Trade contractors managing jobs & clients</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">Vendor Listing (Premium)</td>
                    <td className="p-3 text-slate-700">$100/month</td>
                    <td className="p-3 text-slate-700">Market vendors with high inventory</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">Vendor Listing (Basic)</td>
                    <td className="p-3 text-slate-700">$35/month</td>
                    <td className="p-3 text-slate-700">Market vendors with limited inventory</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">Limited Communication</td>
                    <td className="p-3 text-slate-700">$1.50</td>
                    <td className="p-3 text-slate-700">One-time contact inquiry</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-700">Quote Request</td>
                    <td className="p-3 text-slate-700">$1.75</td>
                    <td className="p-3 text-slate-700">Request contractor quote</td>
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

        {/* Section 11 - Platform Facilitation Fees */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Platform Facilitation Fees</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            SurfCoast Marketplace charges facilitation fees to cover payment processing and platform maintenance. Fees are calculated based on a contractor's annual earnings tier and deducted from completed transactions as follows:
          </p>
          
          <h3 className="font-semibold text-slate-900 mb-3">Contractor Sliding Scale Fees (Based on Annual Earnings)</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li><strong>Bronze Tier ($0 - $15,000 annual):</strong> 2% facilitation fee. Example: a $1,000 job pays out $980 to the contractor.</li>
            <li><strong>Silver Tier ($15,000 - $50,000 annual):</strong> 10% facilitation fee. Example: a $1,000 job pays out $900 to the contractor.</li>
            <li><strong>Gold Tier ($50,000+ annual):</strong> 15% facilitation fee. Example: a $1,000 job pays out $850 to the contractor.</li>
          </ul>
          <p className="text-slate-700 text-sm mb-4 italic">
            Tier is automatically determined based on cumulative annual earnings and updates automatically. Tiers reset annually, with lifetime earnings tracked separately. Tier changes apply to future payouts.
          </p>

          <h3 className="font-semibold text-slate-900 mb-3">Farmers Market & Swap Meet Vendors</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li><strong>Subscription Model:</strong> $35/month flat fee for unlimited listings and transactions.</li>
            <li><strong>Facilitation Fee Model:</strong> 5% facilitation fee on transactions processed through the platform. Example: a $100 sale results in a $95 payout to the vendor.</li>
          </ul>

          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace and all associates hold no responsibility for any outcomes, disputes, or damages arising from transactions. All users engage entirely at their own risk and are solely liable for their agreements.
          </p>
        </div>

        {/* Section 11 - Modifications */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Modifications</h2>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace reserves the right to update these Terms at any time. Continued use of the platform after any update constitutes acceptance of the revised Terms. Users are encouraged to review this page periodically.
          </p>
        </div>

        {/* Section 12 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact</h2>
          <p className="text-slate-700 leading-relaxed">
            For questions regarding these Terms, contact us through the platform's support channel.
          </p>
        </div>

        {/* Final Acknowledgment */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border-l-4 border-blue-600">
          <p className="text-slate-900 font-semibold leading-relaxed">
            By using SurfCoast Marketplace, you acknowledge that you have read, understood, and agreed to these Terms of Service in full.
          </p>
        </div>

        {/* Back to Home Button - Bottom */}
        <Link to="/Landing" className="block text-center">
          <Button variant="outline" className="gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}