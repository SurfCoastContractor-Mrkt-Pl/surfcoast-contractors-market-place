import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmptyStateIllustration({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel = 'Get Started',
  onAction = null
}) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(createPageUrl('MarketDirectory'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Decorative background circle */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-2xl opacity-40 w-40 h-40"></div>
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border-2 border-amber-200 shadow-lg">
          <Icon className="w-10 h-10 text-amber-600" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">{title}</h3>
      <p className="text-slate-600 text-center max-w-sm mb-6 leading-relaxed">{description}</p>

      {/* Action button */}
      <button
        onClick={handleAction}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
      >
        {actionLabel}
        <span>→</span>
      </button>
    </div>
  );
}