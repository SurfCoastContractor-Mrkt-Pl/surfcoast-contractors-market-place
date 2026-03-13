import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Info } from 'lucide-react';
import TradeSpecificGuidance from './TradeSpecificGuidance';

const STATES = [
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'NY', name: 'New York' },
  { code: 'FL', name: 'Florida' },
  { code: 'WA', name: 'Washington' },
  { code: 'CO', name: 'Colorado' },
];

const TRADES = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC Technician' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'painter', name: 'Painter' },
  { id: 'mason', name: 'Mason' },
  { id: 'landscaper', name: 'Landscaper' },
];

export default function LegalResourcesHub({ userLocation = null, userTrade = null }) {
  const [selectedState, setSelectedState] = useState(userLocation ? 'CA' : 'CA');
  const [selectedTrade, setSelectedTrade] = useState(userTrade || 'electrician');

  return (
    <div className="w-full space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Legal Resources & Contract Guidelines
          </CardTitle>
          <CardDescription>
            Understand your state's requirements and what's expected in home improvement contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-1">ℹ️ Important Legal Note</p>
            <p>
              While SurfCoast Contractor Marketplace facilitates connections, <strong>both contractors and customers are responsible for complying with all local, state, and federal laws</strong>. These resources are provided for informational purposes only and are not legal advice. Consult with a legal professional if you have questions about contract requirements in your state.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="state" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="state">State Requirements</TabsTrigger>
          <TabsTrigger value="trade">Trade-Specific Guidance</TabsTrigger>
        </TabsList>

        <TabsContent value="state" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Your State</CardTitle>
              <CardDescription>View home improvement contract requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATES.map(state => (
                  <button
                    key={state.code}
                    onClick={() => setSelectedState(state.code)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedState === state.code
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {state.name}
                  </button>
                ))}
              </div>

              <TradeSpecificGuidance 
                location={`City, ${STATES.find(s => s.code === selectedState)?.name}`}
                tradeType={null}
                showAsCard={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Your Trade</CardTitle>
              <CardDescription>View specific legal requirements for your profession</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRADES.map(trade => (
                  <button
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade.id)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      selectedTrade === trade.id
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {trade.name}
                  </button>
                ))}
              </div>

              <TradeSpecificGuidance 
                tradeType={selectedTrade}
                location={userLocation}
                showAsCard={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Common Legal Pitfalls to Avoid</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-green-900">
            <li className="flex gap-3">
              <span className="font-bold text-green-600">❌</span>
              <span><strong>Cash-only deals without documentation:</strong> Always get written agreements, even for small jobs.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">❌</span>
              <span><strong>Paying 100% upfront:</strong> Link payments to completed milestones to protect both parties.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">❌</span>
              <span><strong>Verbal agreements on scope changes:</strong> Always document changes in writing with updated pricing.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">❌</span>
              <span><strong>Skipping permits:</strong> Many jurisdictions require permits for major work—verify with your local building dept.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">❌</span>
              <span><strong>No insurance/licensing verification:</strong> Both contractors and customers should verify credentials upfront.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">❌</span>
              <span><strong>Ignoring warranty obligations:</strong> Know what you're required to warrant and for how long.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://www.ftc.gov/consumer-advice/consumer-topics/shopping/home-contractors"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="flex-1">FTC: Home Contractor Information</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <a
            href="https://www.consumer.ftc.gov/articles/0008-home-improvement-contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="flex-1">FTC: Home Improvement Contracts Guide</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <a
            href="https://www.bbb.org/us/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="flex-1">Better Business Bureau (BBB)</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}