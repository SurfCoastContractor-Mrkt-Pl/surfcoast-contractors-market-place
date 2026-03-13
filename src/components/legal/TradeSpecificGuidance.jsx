import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// State-specific resources mapping
const STATE_RESOURCES = {
  CA: {
    name: 'California',
    homeImprovementLink: 'https://www.dir.ca.gov/dlse/HomeImprovementsGuide.html',
    description: 'Contractors must provide written contracts before starting work, include specific terms, and register with the Department of Consumer Affairs.',
  },
  TX: {
    name: 'Texas',
    homeImprovementLink: 'https://www.tdlr.texas.gov/apps/hlicense/about_hi.asp',
    description: 'Home improvement contracts must comply with TDLR requirements, include detailed descriptions of work, and timeline.',
  },
  NY: {
    name: 'New York',
    homeImprovementLink: 'https://www.dos.ny.gov/licensing/home-improvement',
    description: 'Contractors must include specific disclosures, payment terms, and scope of work in all contracts.',
  },
  FL: {
    name: 'Florida',
    homeImprovementLink: 'https://www.myfloridalicense.com/dbpr/hr/',
    description: 'All contracts must include proper licensing information and comply with Florida Statutes Chapter 655.',
  },
  WA: {
    name: 'Washington',
    homeImprovementLink: 'https://dol.wa.gov/business-and-worker-protections/residential-contractors',
    description: 'Contractors must provide detailed cost estimates and comply with RCW 18.27 regulations.',
  },
  CO: {
    name: 'Colorado',
    homeImprovementLink: 'https://dora.colorado.gov/dcp',
    description: 'Contractors must be licensed and provide written contracts with detailed scope of work.',
  },
};

// Trade-specific legal requirements
const TRADE_REQUIREMENTS = {
  electrician: {
    name: 'Electrician',
    requirements: [
      'Must be licensed and insured',
      'All work must comply with National Electrical Code (NEC)',
      'Permits required for most electrical work',
      'Final inspection documentation needed',
      'Warranty on workmanship (typically 1 year)',
    ],
    documentation: [
      'Detailed scope of work',
      'Material list and costs',
      'Timeline for completion',
      'Permit information',
      'Final inspection sign-off',
    ],
  },
  plumber: {
    name: 'Plumber',
    requirements: [
      'Must be licensed in your state',
      'All work must meet plumbing code standards',
      'Backflow prevention devices may be required',
      'Permits needed for most installations',
      'Pressure tests and inspections required',
    ],
    documentation: [
      'Detailed scope of work',
      'Materials specification',
      'Layout/diagram of work',
      'Timeline and payment schedule',
      'Inspection certificates',
    ],
  },
  carpenter: {
    name: 'Carpenter',
    requirements: [
      'Must be properly insured',
      'Building permits required for structural work',
      'Work must meet building codes',
      'Final walkthrough and approval documented',
      'Warranty on workmanship typical',
    ],
    documentation: [
      'Detailed scope of work with measurements',
      'Material specifications and grades',
      'Timeline with milestones',
      'Before/after photo documentation',
      'Final inspection checklist',
    ],
  },
  hvac: {
    name: 'HVAC Technician',
    requirements: [
      'Must be licensed and EPA certified (for refrigerants)',
      'All work must meet HVAC code standards',
      'Permits required for new installations',
      'System testing and documentation required',
      'Warranty on parts and labor typical',
    ],
    documentation: [
      'Detailed scope of work',
      'Equipment specifications and model numbers',
      'Load calculations for sizing',
      'Timeline for installation',
      'Performance test results and warranty',
    ],
  },
  roofer: {
    name: 'Roofer',
    requirements: [
      'Must be licensed and insured',
      'Permits required for roofing work',
      'Fall protection compliance mandatory',
      'Materials must meet local building codes',
      'Warranty documentation essential',
    ],
    documentation: [
      'Detailed scope and measurements',
      'Material specifications (shingles, underlayment, etc.)',
      'Timeline for completion',
      'Warranty details (materials and labor)',
      'Final inspection with photo documentation',
    ],
  },
  painter: {
    name: 'Painter',
    requirements: [
      'Surface preparation is critical',
      'Lead paint awareness/compliance (if applicable)',
      'Proper ventilation and safety equipment',
      'Paint specifications clearly stated',
      'Multi-coat requirements documented',
    ],
    documentation: [
      'Detailed scope (rooms, surfaces)',
      'Paint brand, type, and color codes',
      'Prep work and surface treatment details',
      'Number of coats to be applied',
      'Timeline and cleanup plan',
    ],
  },
  mason: {
    name: 'Mason',
    requirements: [
      'Structural work requires permits',
      'All work must meet building codes',
      'Weather protection during curing crucial',
      'Mortar and material specifications important',
      'Final inspection and walkthrough documented',
    ],
    documentation: [
      'Detailed scope with dimensions',
      'Material specifications (brick, stone, mortar type)',
      'Site preparation requirements',
      'Timeline (accounting for curing time)',
      'Final inspection and photo documentation',
    ],
  },
  landscaper: {
    name: 'Landscaper',
    requirements: [
      'Permits may be required for certain work',
      'Property line verification important',
      'Tree removal may require permits',
      'Site restoration and cleanup expected',
      'Plant warranty typical (30-90 days)',
    ],
    documentation: [
      'Detailed scope with site plan',
      'Plant specifications and layout',
      'Soil testing results if applicable',
      'Timeline for planting and establishment',
      'Care instructions and warranty period',
    ],
  },
  contractor_general: {
    name: 'General Contractor',
    requirements: [
      'Must be licensed to pull permits',
      'Responsible for all subcontractor compliance',
      'Project timeline and milestones critical',
      'Payment schedule must follow progress',
      'Final walkthrough and sign-off required',
    ],
    documentation: [
      'Complete project scope of work',
      'Detailed timeline with milestones',
      'List of all subcontractors and trades',
      'Payment schedule tied to progress',
      'Change order procedures documented',
    ],
  },
};

export default function TradeSpecificGuidance({ 
  tradeType = null, 
  location = null, 
  showAsCard = true,
  showAsAlert = false 
}) {
  const [expandedTrade, setExpandedTrade] = useState(null);

  // Extract state from location (e.g., "Denver, Colorado" -> "CO")
  const getStateCode = (locationStr) => {
    if (!locationStr) return null;
    const parts = locationStr.split(',').map(p => p.trim());
    const state = parts[parts.length - 1];
    const stateMap = {
      'California': 'CA', 'Texas': 'TX', 'New York': 'NY', 'Florida': 'FL',
      'Washington': 'WA', 'Colorado': 'CO',
    };
    return stateMap[state] || null;
  };

  const stateCode = getStateCode(location);
  const stateResource = stateCode ? STATE_RESOURCES[stateCode] : null;
  const tradeKey = tradeType?.toLowerCase().replace(/\s+/g, '_') || 'contractor_general';
  const tradeGuidance = TRADE_REQUIREMENTS[tradeKey] || TRADE_REQUIREMENTS['contractor_general'];

  if (!showAsCard && !showAsAlert) return null;

  const content = (
    <div className="space-y-4">
      {/* State-Specific Resources */}
      {stateResource && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📋 {stateResource.name} — Helpful Contract Resources</h4>
          <p className="text-sm text-blue-800 mb-3">{stateResource.description}</p>
          <a 
            href={stateResource.homeImprovementLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            <FileText className="w-4 h-4" />
            View {stateResource.name} Guidelines
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Trade-Specific Guidance */}
      <div className="space-y-3">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-900 mb-2">⚙️ {tradeGuidance.name} — Helpful Contract Elements</h4>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">Items to consider discussing:</p>
              <ul className="space-y-1">
                {tradeGuidance.requirements.map((req, idx) => (
                  <li key={idx} className="text-xs text-amber-700 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-600" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-1">Suggested documentation:</p>
              <ul className="space-y-1">
                {tradeGuidance.documentation.map((doc, idx) => (
                  <li key={idx} className="text-xs text-amber-700 flex items-start gap-2">
                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-600" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">✓ Safeguards That Help Protect Both Parties</h4>
        <ul className="text-xs text-green-800 space-y-1">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Written Agreement:</strong> Documenting the scope, costs, timeline, and responsibilities helps both parties stay aligned.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Milestone-Based Payments:</strong> Linking payments to completed work can provide security for both sides.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Verify Credentials:</strong> Confirming contractor licensing and insurance can be valuable due diligence.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Photo Documentation:</strong> Before/after photos create a clear record of the work completed.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Change Documentation:</strong> Recording any changes to scope or costs in writing helps avoid disputes.</span>
          </li>
        </ul>
      </div>
    </div>
  );

  if (showAsAlert) {
    return (
      <Alert className="border-amber-300 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          {content}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-slate-300 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-lg">📋 Helpful Contract & Legal Safeguards</CardTitle>
        <CardDescription>Optional resources to help both parties understand home improvement agreements</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}