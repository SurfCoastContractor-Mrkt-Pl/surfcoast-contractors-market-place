import React from 'react';

export default function WAVEOSEcosystemOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">WAVE OS Ecosystem Overview</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          The WAVE OS ecosystem is designed to support independent professionals on the SurfCoast platform. It comprises two main systems: <strong>WAVE OS</strong> for contractors managing client projects, and <strong>WAVEshop OS</strong> for vendors handling in-person sales.
        </p>
      </div>

      {/* WAVE OS Section */}
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-4">WAVE OS (Contractor System)</h4>
        <p className="text-slate-700 mb-4">
          This system is exclusively for contractors who source projects from <code className="bg-slate-100 px-2 py-1 rounded">SurfCoastcmp.com</code> client postings.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Tier</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Price</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Key Features</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Starter</td>
                <td className="border border-slate-300 px-4 py-2">$19/month</td>
                <td className="border border-slate-300 px-4 py-2">Profile management, job discovery, basic messaging, payment processing</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Pro</td>
                <td className="border border-slate-300 px-4 py-2">$39/month</td>
                <td className="border border-slate-300 px-4 py-2">All Starter + Availability calendar, lead tracking, SMS integration, photo uploader</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Max</td>
                <td className="border border-slate-300 px-4 py-2">$59/month</td>
                <td className="border border-slate-300 px-4 py-2">All Pro + Route optimization, invoicing, financial reporting, CRM tools, equipment management</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Premium</td>
                <td className="border border-slate-300 px-4 py-2">$100/month</td>
                <td className="border border-slate-300 px-4 py-2">All Max + Workflow automation, predictive analytics, priority support, marketing toolkit</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVE Residential Bundle</td>
                <td className="border border-slate-300 px-4 py-2">$125/month</td>
                <td className="border border-slate-300 px-4 py-2">All Premium + Residential project templates, custom documents, advanced progress billing</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-red-600">18%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-slate-900 mb-2">WAVE OS Summary</h5>
          <p className="text-slate-700 text-sm">
            This system is an integrated operating platform for independent contractors. It provides a structured environment for contractors to accept and manage field-based jobs solely from the SurfCoastcmp.com platform. Its tiered subscription model offers a progressive suite of features that evolve with contractor experience. All jobs processed through WAVE OS are subject to an <strong>18% facilitation fee</strong>. Access is contingent upon an active subscription.
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
                <td className="border border-slate-300 px-4 py-2 font-semibold">WAVEshop OS</td>
                <td className="border border-slate-300 px-4 py-2">$35/month</td>
                <td className="border border-slate-300 px-4 py-2">Manual inventory management, sales tracking, location updates, optional sync to MarketShop</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-green-600">0%</td>
                <td className="border border-slate-300 px-4 py-2 font-semibold text-orange-600">5% (MarketShop only)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-semibold text-slate-900 mb-2">WAVEshop OS Summary</h5>
          <p className="text-slate-700 text-sm">
            This system is tailored for market shop vendors to optimize their operations during physical, in-person sales events. It allows vendors to manage a distinct in-person inventory, record sales, and broadcast their current market location. Sales made directly through WAVEshop OS at physical venues are <strong>exempt from facilitation fees</strong>; vendors only pay a $35/month subscription. An optional feature enables automatic synchronization of in-person sales data with their online MarketShop inventory. The <strong>5% facilitation fee</strong> for vendors only applies to sales conducted through their online MarketShop profile, not to in-person transactions.
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
              <li>Online job discovery & management</li>
              <li>In-person fieldwork execution</li>
              <li>18% facilitation fee on all jobs</li>
              <li>5 subscription tiers with progressive features</li>
              <li>Subscription-based access required</li>
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
              <li>Single subscription tier ($35/month)</li>
              <li>Optional sync to online MarketShop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}