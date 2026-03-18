import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600">SurfCoast Marketplace</p>
          <p className="text-slate-500 text-sm mt-3">Last Updated: March 17, 2026</p>
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
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">c) Transaction Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Payment activity processed through Stripe (we do not store full card numbers)</li>
                <li>Quote requests, job postings, and related communications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">d) Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Pages visited, features used, search queries</li>
                <li>Device type, browser type, operating system</li>
                <li>Cookies and session data</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">e) Communications</h3>
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
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. How We Share Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-4">We may share your information only in the following limited circumstances:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li><span className="font-semibold">Stripe</span> — for payment processing and identity verification (governed by Stripe's Privacy Policy)</li>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
          <p className="text-slate-700 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of non-essential communications</li>
            <li>Lodge a complaint with a data protection authority (where applicable)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            To exercise any of these rights, contact us through the platform's support channel.
          </p>
        </div>

        {/* Section 8 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. California Residents — CCPA Notice</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
            <li>The right to know what personal information is collected and how it is used</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to opt out of the sale of personal information (we do not sell personal information)</li>
            <li>The right to non-discrimination for exercising your privacy rights</li>
          </ul>
          <p className="text-slate-700 leading-relaxed">
            To submit a CCPA request, contact us through the platform's support channel.
          </p>
        </div>

        {/* Section 9 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
          <p className="text-slate-700 leading-relaxed">
            SurfCoast Marketplace is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has created an account, we will delete the account and associated data immediately.
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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact</h2>
          <p className="text-slate-700 leading-relaxed">
            For privacy-related questions or requests, contact us through the platform's support channel.
          </p>
        </div>

        {/* Final Acknowledgment */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border-l-4 border-blue-600">
          <p className="text-slate-900 font-semibold leading-relaxed">
            By using SurfCoast Marketplace, you acknowledge that you have read and understood this Privacy Policy.
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