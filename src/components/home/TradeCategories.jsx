import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Zap, Droplets, Hammer, Wind, Layers, Home, 
  Paintbrush, Flame, Grid3X3, TreePine, MoreHorizontal 
} from 'lucide-react';

const trades = [
  { id: 'electrician', name: 'Electricians', icon: Zap, color: 'bg-yellow-500' },
  { id: 'plumber', name: 'Plumbers', icon: Droplets, color: 'bg-blue-500' },
  { id: 'carpenter', name: 'Carpenters', icon: Hammer, color: 'bg-amber-700' },
  { id: 'hvac', name: 'HVAC Techs', icon: Wind, color: 'bg-cyan-500' },
  { id: 'mason', name: 'Masons', icon: Layers, color: 'bg-stone-500' },
  { id: 'roofer', name: 'Roofers', icon: Home, color: 'bg-red-600' },
  { id: 'painter', name: 'Painters', icon: Paintbrush, color: 'bg-purple-500' },
  { id: 'welder', name: 'Welders', icon: Flame, color: 'bg-orange-500' },
  { id: 'tiler', name: 'Tilers', icon: Grid3X3, color: 'bg-teal-500' },
  { id: 'landscaper', name: 'Landscapers', icon: TreePine, color: 'bg-green-600' },
];

export default function TradeCategories() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Browse by Trade Specialty
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find certified professionals in specific construction trades
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {trades.map((trade) => {
            const Icon = trade.icon;
            return (
              <Link
                key={trade.id}
                to={createPageUrl(`Contractors?trade=${trade.id}`)}
                className="group flex flex-col items-center p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className={`w-14 h-14 rounded-xl ${trade.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900">
                  {trade.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <Link
            to={createPageUrl('Contractors?type=general')}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            <MoreHorizontal className="w-5 h-5" />
            View All General Contractors
          </Link>
        </div>
      </div>
    </section>
  );
}