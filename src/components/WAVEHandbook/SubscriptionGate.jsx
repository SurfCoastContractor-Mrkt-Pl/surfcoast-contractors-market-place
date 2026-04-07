import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionGate({ onSubscribe }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Unlock the Full Handbook
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          The complete WAVE Handbook, including detailed ecosystem pricing, features, and tier comparisons, is exclusively available to active WAVE OS ecosystem subscribers.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Path</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* WAVE OS */}
            <div className="border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-blue-600 mb-2">WAVE OS</h3>
              <p className="text-slate-600 text-sm mb-4">For independent contractors managing client projects</p>
              <ul className="text-sm text-slate-700 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>5 subscription tiers ($19–$125/month)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>18% facilitation fee</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Complete business toolkit</span>
                </li>
              </ul>
            </div>

            {/* WAVEshop OS */}
            <div className="border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-green-600 mb-2">WAVEshop OS</h3>
              <p className="text-slate-600 text-sm mb-4">For vendors managing in-person market sales</p>
              <ul className="text-sm text-slate-700 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>Single tier at $35/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>0% fee on in-person sales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>Inventory & location management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-slate-600 mb-8">
          Subscribe to any plan in the WAVE OS ecosystem to access the complete handbook and unlock all features.
        </p>

        <Button
          onClick={onSubscribe}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg font-semibold"
        >
          View Subscription Options
        </Button>
      </div>
    </div>
  );
}