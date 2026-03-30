import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';

const CATEGORY_COLORS = {
  drain: 'bg-slate-100 text-slate-700 border-slate-300',
  supply: 'bg-blue-50 text-blue-700 border-blue-200',
  fittings: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  valves: 'bg-amber-50 text-amber-700 border-amber-200',
  fixtures: 'bg-purple-50 text-purple-700 border-purple-200',
  seals: 'bg-rose-50 text-rose-700 border-rose-200',
  hardware: 'bg-zinc-100 text-zinc-700 border-zinc-300',
};

const CATEGORY_LABELS = {
  drain: 'Drain',
  supply: 'Supply',
  fittings: 'Fittings',
  valves: 'Valves',
  fixtures: 'Fixtures',
  seals: 'Seals',
  hardware: 'Hardware',
};

export default function PartLibrary({ parts, selectedPart, onSelectPart, onPlacePart }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...new Set(parts.map(p => p.category).filter(Boolean))];

  const filtered = parts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Card className="flex flex-col overflow-hidden" style={{ maxHeight: '55vh' }}>
      <div className="p-3 border-b bg-white">
        <h3 className="font-semibold text-sm text-slate-800 mb-2">Parts Library</h3>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
            placeholder="Search parts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No parts found.</p>
        ) : filtered.map(part => (
          <div
            key={part.id}
            className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPart?.id === part.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onSelectPart(selectedPart?.id === part.id ? null : part)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-slate-800 leading-snug">{part.name}</p>
                {part.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{part.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {part.category && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[part.category] || 'bg-gray-100 text-gray-600'}`}>
                    {CATEGORY_LABELS[part.category] || part.category}
                  </span>
                )}
                {part.quantity && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                    ×{part.quantity}
                  </span>
                )}
              </div>
            </div>

            {selectedPart?.id === part.id && (
              <Button
                size="sm"
                className="w-full mt-2 gap-1.5 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={(e) => { e.stopPropagation(); onPlacePart(part); }}
              >
                <Plus className="w-3 h-3" />
                Place in Scene
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}