/**
 * CommFeeExplainer — shown before a client pays the $1.50 communication fee.
 * Clearly explains WHY it exists and WHAT they get, reducing abandonment.
 */
import { Shield, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function CommFeeExplainer({ contractorName, onProceed, onCancel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md mx-auto shadow-lg">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-7 h-7 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Start a Conversation</h2>
        <p className="text-sm text-gray-600">
          Connect directly with <strong>{contractorName || 'this contractor'}</strong>
        </p>
      </div>

      {/* Fee clarity */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-black text-orange-600">$1.50</span>
          <span className="text-sm text-gray-600">one-time access fee</span>
        </div>
        <p className="text-xs text-gray-600">
          This small fee keeps SurfCoast spam-free and ensures every contractor only receives serious, quality inquiries.
        </p>
      </div>

      {/* What they get */}
      <div className="space-y-3 mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">What you get</p>
        {[
          { icon: Clock, text: '60-minute timed communication session with the contractor' },
          { icon: MessageSquare, text: 'Direct messaging to discuss your project, timeline, and pricing' },
          { icon: Shield, text: 'Scope of Work agreement and estimate sent to you for review' },
          { icon: CheckCircle2, text: 'No work begins until you approve — you stay in control' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <Icon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onProceed}
          className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors"
        >
          Pay $1.50 & Connect
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        Secure payment via Stripe. No subscription required.
      </p>
    </div>
  );
}