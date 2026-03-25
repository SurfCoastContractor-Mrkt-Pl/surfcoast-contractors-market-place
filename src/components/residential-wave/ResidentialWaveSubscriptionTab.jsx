import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ResidentialWaveSubscriptionTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Subscription & Billing</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional Plan */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle>Professional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold text-slate-900">$49</p>
              <p className="text-slate-600">per month</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Unlimited Jobs
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> CRM & Leads
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Invoicing
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Mobile App
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>✗</span> Advanced Analytics
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>✗</span> Document Templates
              </li>
            </ul>
            <Button className="w-full">Start Free Trial</Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Enterprise</CardTitle>
              <span className="text-xs font-semibold px-3 py-1 rounded bg-blue-600 text-white">POPULAR</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold text-slate-900">$99</p>
              <p className="text-slate-600">per month</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Everything in Professional
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Advanced Analytics
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Document Templates
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> CSLB Contract Management
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Team Management
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-green-600">✓</span> Priority Support
              </li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
          </CardContent>
        </Card>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Plan</p>
              <p className="text-lg font-semibold text-slate-900">Trial (Free)</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Next Billing</p>
              <p className="text-lg font-semibold text-slate-900">Manual upgrade required</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}