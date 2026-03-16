import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Terms, Policies & Acknowledgements</h1>
          <p className="text-slate-400 mt-2">Last updated: March 3, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-12">
          
          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Refund Policy</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                We genuinely appreciate every person who trusts SurfCoast with their project. Our fees are kept intentionally small — just $1.75 per quote request — because we want this platform to be accessible and fair for everyone.
              </p>
              <p>
                Because our services are delivered the moment payment is made — your quote request is instantly sent to the contractor, and your communication access is immediately activated — we're unable to offer refunds once a transaction is processed. The value is delivered right away, and there's no way to "unsend" a request or reclaim that window of access.
              </p>
              <p>
                For the $50/month unlimited communication subscription, cancelling at any time will stop future charges immediately — you keep full access through the end of your current billing period, and you won't be charged again.
              </p>
              <p>
                We know that's not always what someone hopes to hear, and we're truly sorry if a situation didn't go as expected. If you believe there was a technical failure or error on our end, please don't hesitate to reach out — we will always do our best to make it right.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Responsibilities</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                By using SurfCoast Contractor Marketplace, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Provide accurate and truthful information in your profile</li>
                <li>Treat all users with respect and professionalism</li>
                <li>Not engage in fraudulent, deceptive, or illegal activities</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect intellectual property and confidentiality</li>
              </ul>
            </div>
          </section>

          {/* Fees & Pricing */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Fees & Pricing</h2>
            <div className="space-y-4 text-slate-700">
              <p>SurfCoast Contractor Market Place charges the following platform fees:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Job / Project Posting (Customers):</strong> Always free. Customers post their jobs and projects at no cost so contractors can browse and decide if they'd like to pursue the work.</li>
                <li><strong>Blind Quote Request (Customers only — $1.75):</strong> When a customer wants a contractor to provide a blind estimate or quote on their posted job or project, a one-time $1.75 fee is charged to the customer. This covers one quote request per contractor. Each additional contractor quote request requires a separate $1.75 fee. Contractors are not charged any fee to view jobs or submit quotes.</li>
                <li><strong>Communication Session ($1.50 — applies to both customers and contractors):</strong> Either party may initiate a direct messaging session with the other for a one-time $1.50 fee per session. This unlocks a timed communication window for that engagement. A new $1.50 fee is required to open a new session after one ends.</li>
                <li><strong>Unlimited Communication:</strong> $50.00/month subscription. Allows unlimited messaging across the platform for both customers and contractors. Auto-renews monthly. Cancel anytime — cancellation takes effect at the end of the current billing period.</li>
                <li><strong>Featured Contractor Listing (Contractors only — $29.00/month):</strong> Contractors may optionally upgrade their profile to a featured listing, which places them at the top of search results with a premium badge. Requires an active communication subscription. Auto-renews monthly. Cancel anytime.</li>
                <li><strong>Platform Facilitation Fee (Contractors — 3% of completed job):</strong> A 3% facilitation fee is deducted from the contractor's earnings on every completed and closed-out job. This fee covers payment processing, dispute resolution, review verification, and ongoing platform support. Example: on a $1,000 job, the contractor receives $970.</li>
              </ul>
              <p>All fees are disclosed upfront before payment in compliance with California SB 478 (Honest Pricing Law). Contractor work costs are entirely separate and negotiated directly between you and the contractor — SurfCoast does not process or hold work payments on behalf of customers.</p>
            </div>
          </section>

          {/* After Photos Policy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">After Photos & Account Compliance</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                Contractors are required to upload a minimum of <strong>5 after photos</strong> within <strong>72 hours</strong> of the agreed work date for any completed job. Failure to do so will result in a temporary account lock until the required photos are uploaded.
              </p>
              <p>
                This policy protects customers and maintains platform quality standards. Photos must clearly document the completed work.
              </p>
            </div>
          </section>

          {/* Platform Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Platform Disclaimer</h2>
            <div className="space-y-4 text-slate-700">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">Important Notice:</p>
                <p>
                  SurfCoast Contractor Marketplace is a platform that connects contractors with customers. We are not responsible for the quality, safety, legality, or outcome of any work performed through this platform. All work is conducted between independent parties at their own risk.
                </p>
              </div>
              <h3 className="font-semibold text-slate-900 mt-6">Contractors:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You are solely responsible for the work you perform and its quality</li>
                <li>You must comply with all applicable laws, building codes, and safety regulations</li>
                <li>You are responsible for obtaining necessary licenses, permits, and insurance</li>
                <li>You warrant that you have the authority and qualifications to perform advertised services</li>
                <li>You agree to complete work professionally and on time</li>
              </ul>
              <h3 className="font-semibold text-slate-900 mt-4">Customers:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You are responsible for vetting contractors before hiring</li>
                <li>You should request proof of licensing, insurance, and references</li>
                <li>You agree to communicate clearly about project scope and expectations</li>
                <li>Disputes over work quality or payment are between you and the contractor</li>
              </ul>
            </div>
          </section>

          {/* Liability Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                SurfCoast is not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Injuries, property damage, or accidents related to work performed</li>
                <li>Disputes, payment disagreements, or contract breaches between users</li>
                <li>Non-completion or poor quality of work</li>
                <li>Fraudulent, deceptive, or illegal conduct by users</li>
                <li>Loss of data, account access, or platform downtime</li>
              </ul>
              <p className="mt-4 font-semibold">
                By using SurfCoast, you accept full responsibility for your actions and agree to hold the platform harmless from all claims and damages.
              </p>
            </div>
          </section>

          {/* Privacy & Data */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Privacy & Data Protection</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                Your personal information is protected and used only for platform operations. Contact details are masked until both parties agree to communicate. Identity verification documents are securely stored and reviewed only by authorized personnel.
              </p>
              <p>
                We do not sell user data to third parties. Communication logs and transaction history are kept confidential between you and the platform.
              </p>
            </div>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Account Termination</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                We reserve the right to suspend or terminate accounts that violate our policies, engage in fraudulent activity, or fail to comply with platform guidelines.
              </p>
              <p>
                Terminated accounts will not receive refunds for any pending or completed transactions.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions?</h2>
            <p className="text-slate-700 mb-6">
              If you have questions about these policies or need support, please reach out to our team.
            </p>
            <p className="text-slate-600 mb-4">
              Use the <strong>Contact Admin</strong> option found in your account settings, or reach out through the platform's support features.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}