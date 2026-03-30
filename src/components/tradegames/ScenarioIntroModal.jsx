import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, User, Wrench, X } from 'lucide-react';

const URGENCY_CONFIG = {
  low: { label: 'Low Priority', color: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: 'Standard', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  high: { label: 'Urgent', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 border-red-200' },
};

const DEFAULT_SCENARIOS = {
  plumbing: {
    title: 'Bathroom Plumbing Repair',
    customerName: 'Sarah M.',
    symptoms: ['Water dripping under sink cabinet', 'Low water pressure at faucet', 'Slow drain in basin'],
    context: 'Residential bathroom — 1960s home, original plumbing.',
    objective: 'Diagnose and repair the P-trap assembly and supply line connections.',
    urgency: 'high',
  },
  electrical: {
    title: 'Electrical Panel Inspection',
    customerName: 'James R.',
    symptoms: ['Breaker tripping repeatedly', 'Flickering lights in kitchen'],
    context: 'Single-family home, 200A service panel.',
    objective: 'Identify the faulty circuit and replace the breaker.',
    urgency: 'medium',
  },
};

export default function ScenarioIntroModal({ gameData, onStart, onClose }) {
  const trade = gameData?.trade_type || 'plumbing';
  const scenario = DEFAULT_SCENARIOS[trade] || DEFAULT_SCENARIOS.plumbing;
  const urgency = URGENCY_CONFIG[scenario.urgency] || URGENCY_CONFIG.medium;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-blue-300" />
            <span className="text-xs text-blue-300 font-medium uppercase tracking-wide">Incoming Job</span>
          </div>
          <h2 className="text-xl font-bold">{gameData?.title || scenario.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-blue-200">
              <User className="w-3.5 h-3.5" />
              <span>{scenario.customerName}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urgency.color}`}>
              {urgency.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Symptoms */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Customer Reported</p>
            <ul className="space-y-1.5">
              {scenario.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Site context */}
          <div className="bg-slate-50 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Site</p>
            <p className="text-sm text-slate-700">{scenario.context}</p>
          </div>

          {/* Objective */}
          <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Your Objective</p>
            <p className="text-sm text-slate-800 font-medium">{scenario.objective}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold"
            onClick={() => onStart(scenario)}
          >
            Start Repair Job
          </Button>
        </div>
      </div>
    </div>
  );
}