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
          <h1 className="text-4xl font-bold">Terms & Policies</h1>
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
                We deeply value every transaction and the trust you place in us. Here's why we maintain a no-refund policy:
              </p>
              <p>
                The $1.50 platform fee grants you immediate access to connect with skilled professionals or potential clients. Once payment is processed, you gain instant communication access, the ability to message, share files, and negotiate directly. These services are delivered immediately and cannot be "returned."
              </p>
              <p>
                We understand this may feel strict, and we take that seriously. If you experience a genuine issue—technical problems, fraudulent activity, or service failure on our end—please reach out to our support team. We're committed to making things right.
              </p>
              <p>
                Our no-refund approach also helps us keep fees low and invest in platform security, identity verification, and features that protect both contractors and customers.
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

          {/* Liability Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Liability Disclaimer</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                SurfCoast provides this platform as-is. We do not guarantee the quality, safety, or legality of work performed by contractors, nor do we guarantee customer payment or job completion.
              </p>
              <p>
                We are not liable for disputes between users, injuries, property damage, breach of contract, or any other claims arising from your use of the platform. Contractors and customers use this service at their own risk and should conduct due diligence.
              </p>
              <p>
                By accepting our disclaimer, you agree to hold SurfCoast harmless from any claims or damages.
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
            <Link to={createPageUrl('Home')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Contact Support
              </Button>
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}