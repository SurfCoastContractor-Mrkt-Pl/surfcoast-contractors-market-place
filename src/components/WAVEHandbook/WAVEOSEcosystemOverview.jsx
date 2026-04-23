import React from 'react';

export default function WAVEOSEcosystemOverview() {
  return (
    <div className="space-y-8">

      {/* Last Updated Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
        📅 Last Updated: April 23, 2026 — Security hardening deployed across all backend automation functions. Auth bypass vulnerabilities patched. Demo data RLS isolation applied. Pricing verified against live Pricing page.
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">WAVE OS Ecosystem Overview</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          The WAVE OS ecosystem is designed to support independent professionals on the SurfCoast platform. It comprises two main systems: <strong>WAVE OS</strong> for contractors managing client projects, and <strong>WAVEshop OS</strong> for vendors handling in-person sales.
        </p>
      </div>

      {/* WAVE OS Section */}
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-4">WAVE OS (For Independent Entrepreneurs)</h4>
        <p className="text-slate-700 mb-4">
          This system is for independent entrepreneurs and tradespeople who source projects from <code className="bg-slate-100 px-2 py-1 rounded">SurfCoastcmp.com</code> client postings. All jobs are subject to an <strong>18% facilitation fee</strong> — you receive 82% to your connected bank account.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Tier</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Price</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Unlocks At</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Key Features</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Messaging</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Starter</td>
                <td className="border border-slate-300 px-4 py-2">$19/mo</td>
                <td className="border border-slate-300 px-4 py-2">5 completed jobs</td>
                <td className="border border-slate-300 px-4 py-2">Profile management, job discovery, basic scheduling, payment processing</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-600">$1.50/session or $50/mo unlimited</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Pro</td>
                <td className="border border-slate-300 px-4 py-2">$39/mo</td>
                <td className="border border-slate-300 px-4 py-2">6–49 completed jobs</td>
                <td className="border border-slate-300 px-4 py-2">All Starter + Invoicing, CRM, scope builder, analytics, price book options, referral tracking</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-600">$1.50/session or $50/mo unlimited</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Max</td>
                <td className="border border-slate-300 px-4 py-2">$59/mo</td>
                <td className="border border-slate-300 px-4 py-2">50–99 completed jobs</td>
                <td className="border border-slate-300 px-4 py-2">All Pro + GPS tracking, field ops suite, multi-option proposals, escrow, QuickBooks CSV export, milestone tracking</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-green-700">✓ Free with past clients only</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Premium</td>
                <td className="border border-slate-300 px-4 py-2">$100/mo</td>
                <td className="border border-slate-300 px-4 py-2">100 jobs + verified license</td>
                <td className="border border-slate-300 px-4 py-2">All Max + AI scheduling assistant, AI bio/proposal gen, HubSpot sync, Notion integration, residential invoicing suite, residential document templates, campaign tools, full audit trail</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-green-700">✓ Free with ALL clients</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Messaging Policy Callout */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-semibold text-slate-900 mb-2">📬 Messaging Policy (Updated April 8, 2026)</h5>
          <ul className="text-slate-700 text-sm space-y-1 list-disc list-inside">
            <li><strong>Starter / Pro:</strong> Pay-per-session ($1.50 per 10 min) or $50/month for unlimited messaging.</li>
            <li><strong>WAVE Max:</strong> Free messaging with <em>past clients only</em> (clients from completed &amp; closed jobs). New clients still require a session fee or $50/mo plan.</li>
            <li><strong>WAVE Premium:</strong> Free messaging with <em>all clients</em> — no per-session fees ever.</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-slate-900 mb-2">WAVE OS Summary</h5>
          <p className="text-slate-700 text-sm">
            WAVE OS is an integrated operating platform for independent contractors. It provides a structured environment to accept and manage field-based jobs from the SurfCoastcmp.com platform. Its tiered subscription model offers a progressive suite of features that evolve with contractor experience. All jobs processed through WAVE OS are subject to an <strong>18% facilitation fee</strong>. The Residential Bundle tier has been discontinued — residential features (invoicing, document templates, lead management) are now included in <strong>WAVE Premium</strong>.
          </p>
        </div>
      </div>

      {/* WAVEshop OS Section */}
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-4">WAVEshop OS (Vendor System)</h4>
        <p className="text-slate-700 mb-4">
          This system is tailored for market shop vendors to optimize their operations during physical, in-person sales events.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead>
              <tr className="bg-green-50">
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">System</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Price</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Key Features</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">In-Person Fee</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Online Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2 font-semibold">Market Booths &amp; Spaces</td>
                <td className="border border-slate-300 px-4 py-2">Free profile or $20/mo (waives 5% fee)</td>
                <td className="border border-slate-300 px-4 py-2">Public booth profile, product listings, inventory tracking, reviews, directory listing</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-green-600">0%</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-orange-600">5% (or waived with $20/mo)</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVEshop OS</td>
                <td className="border border-slate-300 px-4 py-2">$35/month</td>
                <td className="border border-slate-300 px-4 py-2">All above + advanced inventory, analytics, marketing toolkit, social integrations, custom branding, extended photo gallery</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-green-600">0%</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-orange-600">5% (MarketShop only)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-semibold text-slate-900 mb-2">WAVEshop OS Summary</h5>
          <p className="text-slate-700 text-sm">
            This system is tailored for market shop vendors to optimize their operations during physical, in-person sales events. Vendors can choose between a 5% facilitation fee per sale or a $20/month subscription that waives the fee entirely. WAVEshop OS is a premium $35/month add-on with advanced booth management features. Sales made directly in-person are <strong>exempt from facilitation fees</strong>; the 5% fee only applies to sales through their online MarketShop profile.
          </p>
        </div>
      </div>

      {/* Key Differences */}
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-4">Key Differences at a Glance</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h5 className="font-semibold text-slate-900 mb-2">WAVE OS</h5>
            <ul className="text-slate-700 text-sm space-y-2 list-disc list-inside">
              <li>Contractor-focused platform</li>
              <li>Sources jobs from SurfCoastcmp.com</li>
              <li>Online job discovery &amp; management</li>
              <li>In-person fieldwork execution</li>
              <li>18% facilitation fee on all jobs</li>
              <li>4 subscription tiers (Starter, Pro, Max, Premium)</li>
              <li>Max: free messaging with past clients</li>
              <li>Premium: free messaging with all clients</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h5 className="font-semibold text-slate-900 mb-2">WAVEshop OS</h5>
            <ul className="text-slate-700 text-sm space-y-2 list-disc list-inside">
              <li>Vendor-focused platform</li>
              <li>Manages physical market/venue sales</li>
              <li>Manual in-person inventory management</li>
              <li>Real-time sales tracking at venues</li>
              <li>0% fee on in-person sales</li>
              <li>Free profile or $20/mo subscription</li>
              <li>Optional WAVEshop OS add-on ($35/mo)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}