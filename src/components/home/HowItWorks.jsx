import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MessageSquare,
  Handshake,
  CheckCircle2,
  Star,
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Post Your Job',
    description: 'Describe the work you need with photos. Contractors see exactly what you\'re looking for.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Request Quotes',
    description: 'Ask contractors for a quote — they\'ll respond with a Scope of Work and Estimate detailing how the work will be done and the total cost.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Handshake,
    title: 'Approve & Schedule',
    description: 'Review the Scope of Work and Estimate. Once approved, work is scheduled and can begin.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: CheckCircle2,
    title: 'Complete & Review',
    description: 'Contractor completes the work and submits after photos. You confirm completion and leave a verified review.',
    color: 'from-green-500 to-green-600',
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 mb-16">
      <div className="text-center mb-12">
        <Badge className="bg-amber-100 text-amber-800 mb-4">HOW IT WORKS</Badge>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Four Simple Steps</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          From posting your job to hiring a professional, the process is straightforward and secure.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative">
              <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="mb-3 text-sm font-semibold text-slate-500">
                  Step {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </Card>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-3 w-6 h-6 text-amber-400">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-600 mb-4">
          ✓ All work is verified | ✓ Transparent pricing | ✓ Secure communication | ✓ Buyer protection
        </p>
      </div>
    </div>
  );
}