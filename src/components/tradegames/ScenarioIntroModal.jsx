import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Wrench, ChevronRight, MessageSquare } from 'lucide-react';

const PLUMBING_SCENARIOS = {
  default: {
    customerName: "Sarah M.",
    callTime: "8:42 AM",
    urgency: "urgent",
    symptoms: [
      "Water dripping from under the bathroom sink — noticed it this morning",
      "Small puddle forming on the cabinet floor overnight",
      "Slight musty smell starting under the sink",
      "Water pressure from the faucet feels lower than usual"
    ],
    customerQuote: "I woke up this morning and found water all over the cabinet under my bathroom sink. I'm not sure how long it's been dripping but the wood looks a little swollen. It's a 15-year-old house and I don't think the pipes have ever been replaced.",
    priorHistory: "No recent plumbing work done. House built 2009. PVC supply lines throughout.",
    urgencyLabel: "Same-Day Service Requested"
  }
};

function UrgencyBadge({ urgency }) {
  const config = {
    urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
    high: { label: "High Priority", className: "bg-orange-100 text-orange-700 border-orange-200" },
    medium: { label: "Standard", className: "bg-blue-100 text-blue-700 border-blue-200" },
    low: { label: "Non-Urgent", className: "bg-green-100 text-green-700 border-green-200" }
  };
  const c = config[urgency] || config.medium;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${c.className}`}>{c.label}</span>;
}

export default function ScenarioIntroModal({ gameData, onStart, onClose }) {
  const scenario = PLUMBING_SCENARIOS.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              <span className="font-semibold text-blue-100 text-sm uppercase tracking-wider">Service Call</span>
            </div>
            <UrgencyBadge urgency={scenario.urgency} />
          </div>
          <h2 className="text-2xl font-bold mb-1">{gameData?.title || 'Bathroom Plumbing Repair'}</h2>
          <p className="text-blue-200 text-sm">Read the customer's report before you begin</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Call Info */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Customer: <strong className="text-slate-700">{scenario.customerName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Called at <strong className="text-slate-700">{scenario.callTime}</strong></span>
            </div>
          </div>

          {/* Customer Quote */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              In their own words
            </p>
            <p className="text-slate-700 text-sm italic leading-relaxed">"{scenario.customerQuote}"</p>
          </div>

          {/* Reported Symptoms */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Reported Symptoms
            </h3>
            <ul className="space-y-2">
              {scenario.symptoms.map((symptom, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>

          {/* Prior History */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prior Service History</p>
            <p className="text-sm text-slate-700">{scenario.priorHistory}</p>
          </div>

          {/* Your Goal */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Your Objective</p>
            <p className="text-sm text-slate-700">
              Diagnose the issue, select the correct replacement parts, and assemble the proper plumbing repair in the 3D bathroom environment. Use the part library to build your solution.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Back
            </Button>
            <Button onClick={onStart} className="flex-2 gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8">
              Start Repair
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}