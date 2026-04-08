import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-serif font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-600">SurfCoast Marketplace</p>
          <p className="text-slate-500 text-sm mt-3">Last Updated: April 8, 2026</p>
          <p className="text-slate-500 text-sm mt-1">Effective Date: April 8, 2026</p>
        </div>

        {/* CCPA/CPRA Quick Links Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">California Residents — Your Privacy Rights</h2>
          <p className="text-blue-800 text-sm mb-4">
            Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), you have specific rights regarding your personal information. We <strong>do not sell or share your personal information</strong> for cross-context behavioral advertising.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:privacy@surfcoastmarketplace.com?subject=CCPA Data Request" className="inline-flex items-center gap-1 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Submit a Privacy Request
            </a>
            <a href="mailto:privacy@surfcoastmarketplace.com?subject=Do Not Sell or Share My Personal Information" className="inline-flex items-center gap-1 border border-blue-600 text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Do Not Sell or Share My Personal Info
            </a>
          </div>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            SurfCoast Marketplace ("Platform," "we," "us," or "our") respects your privacy and is committed to being transparent about how we collect, use, and protect your information. This Privacy Policy applies to all users of SurfCoast Marketplace — customers, contractors, and market vendors.
          </p>
          <p className="text-slate-700 leading-relaxed">
            By using this platform, you agree to the collection and use of information as described in this policy.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
          <p className="text-slate-700 leading-relaxed mb-4">We collect the following types of information:</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">a) Account Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Name, email address, phone number</li>
                <li>Account type (Customer, Contractor, or MarketShop Vendor)</li>
                <li>Profile details you provide during onboarding</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">b) Identity & Compliance Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>For contractors: license numbers, insurance documents, date of birth, last four digits of SSN (for Stripe identity verification only)</li>
                <li>For vendors: business name, permit confirmations, compliance acknowledgments</li>
                <li>IP address and timestamp at the time of waiver/agreement signing</li>
                <li>Government-issued ID and face photos (for contractor identity verification)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">c) Sensitive Personal Information (CPRA)</h3>
              <p className="text-amber-800 text-sm mb-2">Under California's CPRA, the following categories are classified as <strong>sensitive personal information</strong>:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                <li>Government-issued ID numbers (e.g., driver's license, contractor license numbers)</li>
                <li>Financial account information processed through Stripe (last 4 digits of SSN for identity verification only)</li>
                <li>Precise geolocation data (for job location matching)</li>
                <li>Date of birth (collected for minor age verification)</li>
              </ul>
              <p className="text-amber-800 text-sm mt-2">
                We use sensitive personal information <strong>only for the purpose it was collected</strong>. You have the right to limit our use of this information. See Section 8 for how to exercise this right.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">d) Transaction Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Payment activity processed through Stripe (we do not store full card numbers)</li>
                <li>Quote requests, job postings, and related communications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">e) Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Pages visited, features used, search queries</li>
                <li>Device type, browser type, operating system</li>
                <li>Cookies and session data</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">f) Communications</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Messages sent through the platform between users</li>
                <li>Support requests submitted to us</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-4">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Create and manage your account</li>
            <li>Facilitate connections between customers, contractors, and vendors</li>
            <li>Process payments securely through Stripe</li>
            <li>Verify contractor licenses and vendor compliance acknowledgments</li>
            <li>Send transactional emails (receipts, confirmations, status updates)</li>
            <li>Improve platform features and user experience</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
            <li>Maintain legally binding records of waiver and agreement acknowledgments</li>
          </ul>
          <p className="text-slate-700 leading-relaxed font-semibold">
            We do NOT sell your personal information to third parties.
          </p>
          <p className="text-slate-700 leading-relaxed font-semibold mt-2">
            We do NOT share your personal information for cross-context behavioral advertising.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. How We Share Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-4">We may share your information only in the following limited circumstances:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li><span className="font-semibold">Stripe</span> — for payment processing and identity verification (governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Stripe's Privacy Policy</a>)</li>
            <li><span className="font-semibold">HubSpot</span> — for CRM and customer communication management (governed by <a href="https://legal.hubspot.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">HubSpot's Privacy Policy</a>)</li>
            <li><span className="font-semibold">Notion</span> — for project documentation and collaboration features (governed by <a href="https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Notion's Privacy Policy</a>)</li>
            <li><span className="font-semibold">Google</span> — for maps, location services, and search analytics (governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google's Privacy Policy</a>)</li>
            <li><span className="font-semibold">Other Users</span> — limited profile information (name, ratings, service area) is visible to other users as part of normal platform functionality</li>
            <li><span className="font-semibold">Legal Requirements</span> — if required by law, court order, or government authority</li>
            <li><span className="font-semibold">Business Transfers</span> — in the event of a merger, acquisition, or sale of assets, your data may transfer to the successor entity</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            We do not share your private communications, financial details, or compliance documents with other users.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cookies & Tracking</h2>
          <p className="text-slate-700 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Keep you logged in across sessions</li>
            <li>Remember your preferences</li>
            <li>Analyze platform usage and performance</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            You may disable cookies in your browser settings, but some platform features may not function properly without them.
          </p>
        </div>

        {/* Section 6 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
          <p className="text-slate-700 leading-relaxed">
            We retain your data for as long as your account is active or as required by law. Waiver acknowledgment records and compliance logs are retained indefinitely as legally binding records. If you delete your account, personal data will be removed within 30 days except where retention is required by law.
          </p>
        </div>

        {/* Section 7 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights (All Users)</h2>
          <p className="text-slate-700 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of non-essential communications</li>
            <li>Lodge a complaint with a data protection authority (where applicable)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            To exercise any of these rights, email us at <a href="mailto:privacy@surfcoastmarketplace.com" className="text-blue-600 underline font-semibold">privacy@surfcoastmarketplace.com</a>.
          </p>
        </div>

        {/* Section 8 — CCPA/CPRA */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. California Residents — CCPA/CPRA Rights</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
          </p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-1">Right to Know</h3>
              <p className="text-slate-700 text-sm">You may request to know what personal information we have collected about you, including the categories of personal information, sources, business purposes, and third parties with whom we share it.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-1">Right to Delete</h3>
              <p className="text-slate-700 text-sm">You may request deletion of personal information we have collected about you, subject to certain exceptions (e.g., legally required records).</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-1">Right to Correct</h3>
              <p className="text-slate-700 text-sm">You may request correction of inaccurate personal information we maintain about you.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-1">Right to Opt Out of Sale or Sharing</h3>
              <p className="text-slate-700 text-sm">We <strong>do not sell or share your personal information</strong> for cross-context behavioral advertising. No opt-out action is required, but you may submit a formal request to confirm this.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-1">Right to Limit Use of Sensitive Personal Information</h3>
              <p className="text-slate-700 text-sm">You may request that we limit our use of your sensitive personal information (e.g., SSN digits, government IDs, precise geolocation, date of birth) to only what is necessary to provide our services.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-1">Right to Non-Discrimination</h3>
              <p className="text-slate-700 text-sm">We will not discriminate against you for exercising any of your CCPA/CPRA rights.</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-semibold text-sm mb-2">How to Submit a California Privacy Request:</p>
            <p className="text-blue-800 text-sm mb-3">Email us at <a href="mailto:privacy@surfcoastmarketplace.com" className="underline font-bold">privacy@surfcoastmarketplace.com</a> with the subject line "California Privacy Request" and specify which right you are exercising. We will respond within <strong>45 days</strong> as required by law.</p>
            <a href="mailto:privacy@surfcoastmarketplace.com?subject=California Privacy Request" className="inline-flex items-center gap-1 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Submit a California Privacy Request
            </a>
          </div>
        </div>

        {/* Section 9 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace allows contractors aged 13 and older to register with verified parental consent. All users under 18 must complete the minor onboarding process including parental consent documentation before their account is activated. We do not knowingly collect personal information from minors without parental consent. If a minor has registered without required parental consent, their account will be suspended and data removed.
          </p>
        </div>

        {/* Section 10 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Security</h2>
          <p className="text-slate-700 leading-relaxed">
            We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, or disclosure. All payment data is handled exclusively by Stripe and is never stored on our servers. However, no platform can guarantee absolute security, and you use SurfCoast Marketplace at your own risk.
          </p>
        </div>

        {/* Section 11 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Third-Party Links</h2>
          <p className="text-slate-700 leading-relaxed">
            This platform may contain links to third-party websites (such as vendor social media or external payment apps). We are not responsible for the privacy practices or content of any third-party site. Use them at your own discretion.
          </p>
        </div>

        {/* Section 12 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Changes to This Policy</h2>
          <p className="text-slate-700 leading-relaxed">
            We may update this Privacy Policy from time to time. When we do, the "Last Updated" date at the top will be revised. Continued use of the platform after any update constitutes acceptance of the revised policy.
          </p>
        </div>

        {/* Section 13 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact Us</h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            For privacy-related questions, requests, or concerns, contact our dedicated privacy team:
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-slate-800 font-semibold">SurfCoast Marketplace — Privacy Team</p>
            <p className="text-slate-700 mt-1">Email: <a href="mailto:privacy@surfcoastmarketplace.com" className="text-blue-600 underline font-semibold">privacy@surfcoastmarketplace.com</a></p>
            <p className="text-slate-600 text-sm mt-2">We respond to all privacy requests within 45 days as required by CCPA/CPRA.</p>
          </div>
        </div>

        {/* Final Acknowledgment */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border-l-4 border-blue-600">
          <p className="text-slate-900 font-semibold leading-relaxed">
            By using SurfCoast Marketplace, you acknowledge that you have read and understood this Privacy Policy.
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