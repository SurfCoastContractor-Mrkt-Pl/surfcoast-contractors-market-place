import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Users, Map, BarChart3, MessageSquare, FileCheck, Clock } from 'lucide-react';

export default function WaveFOAbout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 gradient-text">
          WAVE FO
        </h1>
        <p className="text-xl sm:text-2xl text-slate-700 max-w-3xl mx-auto mb-4 leading-relaxed">
          The Operating System for Independent Contractors
        </p>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Every job, every dollar, every client interaction—unified in one platform built from the ground up for how contractors actually work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/BecomeContractor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/wave-handbook" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
            Explore Features
          </Link>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">The Fragmentation Problem</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">What Most Contractors Face</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Juggling a dozen different apps just to run one business</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Manual data entry between scheduling, payments, invoicing, and accounting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Compliance headaches—licenses, insurance, labor laws—barely tracked</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>No visibility into profitability per job or per customer</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Why Competitors Fall Short</h3>
              <p className="text-slate-700 mb-4">
                Most platforms address single problems in isolation: CRM for leads, accounting software for invoices, scheduling tools for calendars. None of them speak to each other. None of them understand the unique needs of field work.
              </p>
              <p className="text-slate-700">
                And compliance? It's an afterthought bolted on, not baked into the core.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Enter WAVE FO</h2>
        <p className="text-lg text-slate-700 max-w-3xl mx-auto text-center mb-12 leading-relaxed">
          Built specifically for contractors, WAVE FO unifies every aspect of your business—from the moment you accept a job to the day you get paid and everything in between.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Core Operations */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Streamlined Operations</h3>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>My Day View</strong> — One dashboard shows all your jobs, leads, and appointments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Intelligent Routing</strong> — Optimize your day with automated route planning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Real-Time Documentation</strong> — Capture before/after photos and job notes on-site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Offline-First Design</strong> — Work anywhere, even in basements with no signal</span>
              </li>
            </ul>
          </div>

          {/* Financial & Compliance */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl font-bold text-slate-900">Compliance & Money</h3>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">✓</span>
                <span><strong>Identity Verification</strong> — Built-in, not bolted-on—your entire team verified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">✓</span>
                <span><strong>Stripe Payouts</strong> — Get paid securely, directly to your bank account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">✓</span>
                <span><strong>QuickBooks Integration</strong> — Your financials sync automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">✓</span>
                <span><strong>Smart Invoicing</strong> — Professional invoices generated in seconds</span>
              </li>
            </ul>
          </div>

          {/* Client Relationships */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">Client Connection</h3>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Unified Messaging</strong> — In-app chat and SMS in one inbox</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Automated Updates</strong> — Keep clients informed without lifting a finger</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Review Management</strong> — Collect and respond to feedback seamlessly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Trusted Badge System</strong> — Build credibility with verified reviews</span>
              </li>
            </ul>
          </div>

          {/* Growth & Intelligence */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-slate-900">Growth & Insights</h3>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span><strong>Earnings Analytics</strong> — Know which jobs, clients, and times are most profitable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span><strong>Performance Dashboard</strong> — Track your business metrics in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span><strong>Portfolio Showcase</strong> — Display before/after work to attract clients</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span><strong>Trade Games</strong> — Level up skills while competing with other contractors</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="bg-slate-900 text-white py-16 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Contractors Choose WAVE FO</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Built for Compliance</h3>
              <p className="text-slate-300 text-sm">
                Minor labor laws, licensing verification, insurance tracking—all baked in. Your shield, not your burden.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Built by Contractors</h3>
              <p className="text-slate-300 text-sm">
                We understand field work. Every feature solves a real problem you actually face.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Everything Integrated</h3>
              <p className="text-slate-300 text-sm">
                No switching between apps. One platform. One source of truth. Your entire business in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">The WAVE FO Difference</h2>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-600 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Competitors think in silos</h3>
          <p className="text-slate-700">
            "We have a scheduling tool." "We have invoicing." "We have customer management." They're building puzzle pieces, never asking if the puzzle should exist at all.
          </p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-600 rounded-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">We think in workflows</h3>
          <p className="text-slate-700">
            A contractor's day isn't about managing separate tools—it's about managing jobs. Accept a lead → Schedule it → Complete the work → Document it → Get paid → Keep the client happy. Every piece of WAVE FO serves that flow.
          </p>
        </div>
      </section>

      {/* The Trust Factor */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Built on Trust & Compliance</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-100 rounded-lg p-4">
            <FileCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Identity Verified</p>
            <p className="text-xs text-slate-600">Every contractor checked</p>
          </div>
          <div className="bg-slate-100 rounded-lg p-4">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Minor Protection</p>
            <p className="text-xs text-slate-600">Labor law compliance</p>
          </div>
          <div className="bg-slate-100 rounded-lg p-4">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Secure Payouts</p>
            <p className="text-xs text-slate-600">Stripe Connect verified</p>
          </div>
          <div className="bg-slate-100 rounded-lg p-4">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Rated & Reviewed</p>
            <p className="text-xs text-slate-600">Verified feedback system</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Run Your Business Like a Pro?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join contractors building their own empires on WAVE FO. 14 days free. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/BecomeContractor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="mailto:hello@surfcoast.io" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Ask a Question
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}