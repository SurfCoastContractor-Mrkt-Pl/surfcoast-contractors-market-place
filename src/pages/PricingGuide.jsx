import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Award, DollarSign, ArrowLeft } from 'lucide-react';

export default function PricingGuide() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">SurfCoast Pricing</h1>
          <p className="text-xl text-slate-600">Fair, transparent pricing designed to reward growth.</p>
        </div>

        {/* Contractor Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">For Contractors</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Our sliding scale facilitation fees start low to reduce barriers to entry and reward professionals as they grow.
          </p>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Bronze */}
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">Bronze</CardTitle>
                  <span className="text-3xl font-bold text-amber-600">2%</span>
                </div>
                <CardDescription className="text-base font-semibold">Get Started Risk-Free</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Annual Earnings Range</p>
                  <p className="text-2xl font-bold text-slate-900">$0 - $15K</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Example:</span> A $1,000 job pays out <span className="font-bold text-green-600">$980</span> to you.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Perfect for new contractors</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Minimal fee impact</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Build your reputation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Silver */}
            <Card className="border-2 border-slate-300 bg-slate-50 md:relative md:z-10 md:transform md:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">Silver</CardTitle>
                  <span className="text-3xl font-bold text-slate-600">10%</span>
                </div>
                <CardDescription className="text-base font-semibold">Growing Professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Annual Earnings Range</p>
                  <p className="text-2xl font-bold text-slate-900">$15K - $50K</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Example:</span> A $1,000 job pays out <span className="font-bold text-green-600">$900</span> to you.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>For established contractors</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Fair for growing income</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Path to Gold tier</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Gold */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">Gold</CardTitle>
                  <span className="text-3xl font-bold text-yellow-600">15%</span>
                </div>
                <CardDescription className="text-base font-semibold">Established Experts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Annual Earnings Range</p>
                  <p className="text-2xl font-bold text-slate-900">$50K+</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Example:</span> A $1,000 job pays out <span className="font-bold text-green-600">$850</span> to you.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Top-tier professionals</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Industry-leading rate</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Premium positioning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Tier Info */}
          <Alert className="bg-blue-50 border-blue-200 text-blue-900">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Tier Advancement:</span> Your tier is automatically calculated based on cumulative annual earnings. As you earn more, your fee percentage stays the same until you reach the next tier threshold. Tiers reset each calendar year, but lifetime earnings are tracked separately.
            </AlertDescription>
          </Alert>
        </div>

        {/* Customer Communication Section */}
        <div className="mb-12 border-t pt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">For Customers & Contractors</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Direct communication has a small fee to ensure meaningful connections.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Limited Communication</CardTitle>
                <CardDescription>Single message thread</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-slate-900">$1.50</div>
                <p className="text-sm text-slate-600">
                  One-time payment for initial contact. Perfect for quick questions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Request</CardTitle>
                <CardDescription>No ongoing communication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-slate-900">$1.75</div>
                <p className="text-sm text-slate-600">
                  Get a specific quote for a project without unlimited messaging.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unlimited Messaging</CardTitle>
                <CardDescription>Monthly subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-slate-900">$50/month</div>
                <p className="text-sm text-slate-600">
                  Unlimited communication for ongoing projects and collaborations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Vendors Section */}
        <div className="mb-12 border-t pt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">For Market Vendors</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Choose the payment model that works best for your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-slate-900">$35/month</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Unlimited shop listings</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>No transaction fees</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Keep 100% of sales</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Perfect for high-volume vendors</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 pt-2 border-t">Example: $1,000 in sales = $1,000 to you (after you pay $35/month)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facilitation Fee Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-slate-900">5%</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Pay only on sales</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>No subscription fees</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Flexible pricing</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Great for new vendors</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 pt-2 border-t">Example: $1,000 in sales = $950 to you (5% fee = $50)</p>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-6 bg-green-50 border-green-200 text-green-900">
            <AlertDescription>
              <span className="font-semibold">Switch Anytime:</span> Market vendors can switch between payment models at the start of their next billing cycle without penalties.
            </AlertDescription>
          </Alert>
        </div>

        {/* Why Our Pricing */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Our Pricing?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fair & Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  No hidden fees. No surprises. You always know exactly what you're paying and why.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rewards Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  The more you earn, the more you keep. Our tier system incentivizes success for everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Low Barriers to Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  Starting contractors only pay 2%. We believe in removing friction and building together.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Industry-Leading</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  Even at Gold tier (15%), we're competitive with platforms charging 18-20% flat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/BecomeContractor">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Join as a Contractor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}