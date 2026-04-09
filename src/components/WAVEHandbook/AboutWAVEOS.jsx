import React from 'react';
import { ShieldCheck, DollarSign, Lightbulb, Gem } from 'lucide-react';

export default function AboutWAVEOS() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About WAVE OS</h2>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        At SurfCoast, we understand the challenges independent entrepreneurs face. You're not just a skilled professional; you're a business owner, a project manager, a client liaison, and often, your own accountant. Many tools on the market address one or two aspects of your work, leaving you juggling multiple apps, drowning in paperwork, and struggling to prove your professionalism.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex items-start space-x-4">
          <ShieldCheck className="w-8 h-8 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Built for Trust & Compliance</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Unlike generic platforms, WAVE OS is engineered with robust identity and license verification processes. We proactively support you in maintaining compliance with state-specific regulations and even minor labor laws, giving your clients peace of mind and elevating your professional standing. Your detailed credentials, from HIS licenses to insurance bonds, are organized and verifiable.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <DollarSign className="w-8 h-8 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Seamless Financial Flow</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We eliminate payment friction. With integrated Stripe Connect payouts, you get paid securely and efficiently, direct to your bank account. Manage quotes, invoices, expenses, and even sync with QuickBooks, all within a unified system designed to simplify your financial operations and minimize administrative overhead.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Lightbulb className="w-8 h-8 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Business, Integrated</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Competitors often provide piecemeal solutions. WAVE OS offers a comprehensive hub for your entire business. From smart scheduling and route optimization to client communication (including SMS), project milestones, and even inventory management—we bring all your critical tools together, so you can focus on the work you love.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Gem className="w-8 h-8 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Innovating for Your Growth</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We're not just about logistics; we're about empowerment. Our platform integrates advanced features like AI-powered scheduling assistance and unique "Trade Games" designed to sharpen your skills and highlight your expertise. We help you showcase your portfolio, manage client relationships, and continuously grow your reputation and income.
            </p>
          </div>
        </div>
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed pt-4">
        WAVE OS is more than just software — it's your dedicated partner, built to streamline your operations, ensure compliance, and help you thrive in the modern marketplace. Every job processed through the platform is subject to an <strong>18% facilitation fee</strong>, collected automatically via Stripe. You receive 82% directly to your connected bank account.
      </p>
    </div>
  );
}