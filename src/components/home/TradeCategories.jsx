import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Zap, Droplets, Hammer, Wind, Layers, MoreHorizontal 
} from 'lucide-react';

const trades = [
  { id: 'electrician', name: 'Electricians', icon: Zap, color: 'bg-yellow-500' },
  { id: 'plumber', name: 'Plumbers', icon: Droplets, color: 'bg-blue-500' },
  { id: 'carpenter', name: 'Carpenters', icon: Hammer, color: 'bg-amber-700' },
  { id: 'hvac', name: 'HVAC', icon: Wind, color: 'bg-cyan-500' },
  { id: 'mason', name: 'Masons', icon: Layers, color: 'bg-stone-500' },
];

export default function TradeCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Browse by Trade Specialty
          </h2>
          <p className="text-slate-600 text-sm">
            Find certified professionals in specific construction trades
          </p>
        </div>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {trades.map((trade) => {
            const Icon = trade.icon;
            return (
              <Link
                key={trade.id}
                to={createPageUrl(`Contractors?trade=${trade.id}`)}
                className="group flex flex-col items-center p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className={`w-9 h-9 rounded-lg ${trade.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900 text-xs text-center">
                  {trade.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-6">
          <Link
            to={createPageUrl('Contractors?type=general')}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm"
          >
            <MoreHorizontal className="w-4 h-4" />
            View All Trades
          </Link>
        </div>
      </div>
    </section>
  );
}