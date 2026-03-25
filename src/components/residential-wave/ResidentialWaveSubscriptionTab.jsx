import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ResidentialWaveSubscriptionTab() {
  const [isSoleProprietor, setIsSoleProprietor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const checkSoleProprietor = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.email) {
          const contractors = await base44.entities.Contractor.filter({ email: user.email });
          const contractor = contractors?.[0];
          setIsSoleProprietor(contractor?.is_licensed_sole_proprietor === true && contractor?.contractor_type === 'trade_specific');
        }
      } catch (error) {
        console.error('Error checking contractor status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSoleProprietor();
  }, []);

  const handleBundleSubscribe = async () => {
    setSubscribing(true);
    try {
      const response = await base44.functions.invoke('createResidentialWaveBundleCheckout', {});
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Subscription & Billing</h2>

      <div className={`grid gap-6 ${isSoleProprietor ? 'grid-cols-1 lg:grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {isSoleProprietor && (
          // Residential Wave Bundle (for sole proprietors)
          <Card className="border-2 border-green-500 bg-green-50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Residential Wave Bundle</CardTitle>
                <span className="text-xs font-semibold px-3 py-1 rounded bg-green-600 text-white">BEST VALUE</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold text-slate-900">$125</p>
                <p className="text-slate-600">per month</p>
                <p className="text-xs text-green-700 mt-2">Save $25/month vs. separate plans</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span> All Residential Wave Features
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span> Unlimited invoicing & job tracking
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span> Communication & messaging
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span> Vendor listing features
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span> Document management
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600">✓</span> Priority support
                </li>
              </ul>
              <Button 
                onClick={handleBundleSubscribe} 
                disabled={subscribing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {subscribing ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        )}

        {!isSoleProprietor && (
          <>
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
          </>
        )}
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
            <p className="text-lg font-semibold text-slate-900">{isSoleProprietor ? 'Residential Wave Bundle' : 'Trial (Free)'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Status</p>
            <p className="text-lg font-semibold text-green-600">Active</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Next Billing</p>
            <p className="text-lg font-semibold text-slate-900">{isSoleProprietor ? '$125/month' : 'Manual upgrade required'}</p>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}