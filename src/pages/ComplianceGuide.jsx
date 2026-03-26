import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Lock, Heart, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ComplianceGuide() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SurfCoast Compliance Rules</h1>
          <p className="text-lg text-slate-600">
            Keep your account active and in good standing by following these platform guidelines
          </p>
        </div>

        <div className="space-y-6">
          {/* Rule 1: Payment Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Rule #1: Process All Payments Through SurfCoast
              </CardTitle>
              <CardDescription>Mandatory | Violation: Account Suspension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">The Rule</h4>
                <p className="text-slate-700">
                  All payments for jobs must be processed exclusively through the SurfCoast platform. Off-platform payments via Venmo, PayPal, cash, or other external methods are strictly prohibited.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why It Matters</h4>
                <p className="text-slate-700">
                  Platform payments ensure dispute protection, escrow safety, tax compliance, and fraud prevention for both contractors and customers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens If Violated</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Automatic detection via message scanning</li>
                  <li>14-day grace period to comply</li>
                  <li>After grace period: account restriction + messaging disabled</li>
                  <li>Can appeal with evidence of compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Rule 2: Minor Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Rule #2: Minor Contractors Limited to 20 Hours/Week
              </CardTitle>
              <CardDescription>Age 13-17 Only | Violation: Automatic Lock (7 Days)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">The Rule</h4>
                <p className="text-slate-700">
                  Contractors under 18 years old are limited to a maximum of 20 work hours per week. This is enforced by labor law and platform policy to protect youth workers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Hours Reset</h4>
                <p className="text-slate-700">
                  Your weekly hours counter resets every Monday at midnight (PT). This week's total is calculated from all approved scopes with estimated hours.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens If Violated</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Hours tracked automatically on job approval</li>
                  <li>Exceeding 20 hours = instant account lock</li>
                  <li>Account automatically unlocks after 7 days</li>
                  <li>Can appeal with documentation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Rule 3: After Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Rule #3: Submit After Photos Within 72 Hours
              </CardTitle>
              <CardDescription>Mandatory | Violation: Account Lock Until Appeal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">The Rule</h4>
                <p className="text-slate-700">
                  After completing an approved job, you must submit after photos within 72 hours (3 days) of the agreed work date. Photos are essential for verifying work completion.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Photo Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Clear, well-lit photos of the completed work</li>
                  <li>Multiple angles showing the final result</li>
                  <li>Include a "job together" photo with the customer if possible</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What Happens If Violated</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Daily automated check for missed deadlines</li>
                  <li>Missing photos past 72 hours = account lock</li>
                  <li>Must submit appeal with the missing photos</li>
                  <li>Account unlocks upon admin approval</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Appeals Process */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600" />
                The Appeal Process
              </CardTitle>
              <CardDescription>How to request reinstatement or challenge a violation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">You Have the Right to Appeal</h4>
                <p className="text-blue-800">
                  If your account is locked or flagged, you can submit a compliance appeal to explain your situation and provide evidence of compliance or mitigating circumstances.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Badge>1</Badge>
                  <div>
                    <p className="font-semibold text-blue-900">Submit Appeal</p>
                    <p className="text-sm text-blue-800">Explain the situation and upload supporting evidence</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge>2</Badge>
                  <div>
                    <p className="font-semibold text-blue-900">Admin Review</p>
                    <p className="text-sm text-blue-800">Our team reviews within 2-3 business days</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge>3</Badge>
                  <div>
                    <p className="font-semibold text-blue-900">Decision & Notification</p>
                    <p className="text-sm text-blue-800">You'll receive an email with the outcome</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Tips for Staying Compliant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-green-900">
                <li>✓ Always process payments through SurfCoast — never mention external payment methods in messages</li>
                <li>✓ Check your hours before accepting jobs (minors only)</li>
                <li>✓ Submit after photos immediately after completing work</li>
                <li>✓ Save photos to your phone and upload right away</li>
                <li>✓ If locked for any reason, submit an appeal promptly with evidence</li>
                <li>✓ Review this guide regularly to stay informed</li>
              </ul>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Compliance?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700">
                If you have questions about these rules or need clarification, contact our support team through the platform.
              </p>
              <p className="text-sm text-slate-600">
                Last updated: March 26, 2026 | All contractors must acknowledge these rules on onboarding
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}