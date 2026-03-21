import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketShopListings() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">My Listings</h3>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
          <Plus className="w-4 h-4" /> Add Listing
        </Button>
      </div>
      <div className="bg-white/30 border-2 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center py-14 text-center">
        <Package className="w-10 h-10 text-slate-300 mb-3" />
        <p className="font-medium text-slate-500">No listings yet</p>
        <p className="text-sm text-slate-400 mt-1">Add your first product or service listing to get started.</p>
      </div>
    </div>
  );
}