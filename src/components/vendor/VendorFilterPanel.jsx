import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X, Sliders, Search } from 'lucide-react';

export default function VendorFilterPanel({ filters, onFiltersChange, onClose, isOpen }) {
  // Local draft state — only applies on Submit
  const [draft, setDraft] = useState({ ...filters });

  const handleSubmit = () => {
    onFiltersChange({ ...draft });
    onClose();
  };

  const resetFilters = () => {
    const empty = {
      marketType: 'all',
      location: '',
      category: 'all',
      minRating: 0,
      availability: []
    };
    setDraft(empty);
    onFiltersChange(empty);
  };

  const handleAvailabilityChange = (status) => {
    const availability = draft.availability || [];
    const updated = availability.includes(status)
      ? availability.filter(a => a !== status)
      : [...availability, status];
    setDraft({ ...draft, availability: updated });
  };

  const farmerMarketCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fresh_produce', label: 'Fresh Produce' },
    { value: 'baked_goods', label: 'Baked Goods' },
    { value: 'dairy_eggs', label: 'Dairy & Eggs' },
    { value: 'meat_poultry_seafood', label: 'Meat, Poultry & Seafood' },
    { value: 'plants_flowers', label: 'Plants & Flowers' },
    { value: 'honey_preserves', label: 'Honey & Preserves' },
    { value: 'prepared_foods', label: 'Prepared Foods' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'handmade_crafts', label: 'Handmade Crafts' },
    { value: 'art', label: 'Art' },
    { value: 'health_wellness', label: 'Health & Wellness' },
    { value: 'jewelry', label: 'Jewelry' },
  ];

  const swapMeetCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'tools', label: 'Tools' },
    { value: 'sports_equipment', label: 'Sports Equipment' },
    { value: 'books_media', label: 'Books & Media' },
    { value: 'home_decor', label: 'Home Decor' },
    { value: 'clothing_accessories', label: 'Clothing & Accessories' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'handmade_crafts', label: 'Handmade Crafts' },
    { value: 'vintage_antiques', label: 'Vintage & Antiques' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'toys_games', label: 'Toys & Games' },
    { value: 'art', label: 'Art' },
    { value: 'misc', label: 'Miscellaneous' },
  ];

  const allCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fresh_produce', label: 'Fresh Produce' },
    { value: 'baked_goods', label: 'Baked Goods' },
    { value: 'dairy_eggs', label: 'Dairy & Eggs' },
    { value: 'meat_poultry_seafood', label: 'Meat, Poultry & Seafood' },
    { value: 'plants_flowers', label: 'Plants & Flowers' },
    { value: 'honey_preserves', label: 'Honey & Preserves' },
    { value: 'prepared_foods', label: 'Prepared Foods' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'tools', label: 'Tools' },
    { value: 'sports_equipment', label: 'Sports Equipment' },
    { value: 'books_media', label: 'Books & Media' },
    { value: 'home_decor', label: 'Home Decor' },
    { value: 'clothing_accessories', label: 'Clothing & Accessories' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'handmade_crafts', label: 'Handmade Crafts' },
    { value: 'vintage_antiques', label: 'Vintage & Antiques' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'art', label: 'Art' },
    { value: 'toys_games', label: 'Toys & Games' },
    { value: 'health_wellness', label: 'Health & Wellness' },
    { value: 'misc', label: 'Miscellaneous' },
  ];

  const categoryOptions = draft.marketType === 'farmers_market'
    ? farmerMarketCategories
    : draft.marketType === 'swap_meet'
    ? swapMeetCategories
    : allCategories;

  const labelClass = "text-sm font-semibold text-slate-900 block mb-2";
  const sectionClass = "mb-5";

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-200 ease-in-out overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:translate-x-0 lg:h-auto lg:shadow-none`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Market Type */}
        <div className={sectionClass}>
          <label className={labelClass}>Market Type</label>
          <Select
            value={draft.marketType || 'all'}
            onValueChange={(value) => setDraft({ ...draft, marketType: value, category: 'all' })}
          >
            <SelectTrigger className="w-full bg-white text-slate-900 border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="text-slate-900">All Types</SelectItem>
              <SelectItem value="farmers_market" className="text-slate-900">Farmers Market</SelectItem>
              <SelectItem value="swap_meet" className="text-slate-900">Swap Meet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className={sectionClass}>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            placeholder="City, State"
            value={draft.location || ''}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Category */}
        <div className={sectionClass}>
          <label className={labelClass}>Category</label>
          <Select
            value={categoryOptions.find(c => c.value === draft.category) ? draft.category : 'all'}
            onValueChange={(value) => setDraft({ ...draft, category: value })}
          >
            <SelectTrigger className="w-full bg-white text-slate-900 border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {categoryOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-slate-900">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Rating */}
        <div className={sectionClass}>
          <label className={labelClass}>
            Minimum Rating: <span className="text-slate-700 font-bold">{(draft.minRating || 0).toFixed(1)}★</span>
          </label>
          <Slider
            value={[draft.minRating || 0]}
            onValueChange={(val) => setDraft({ ...draft, minRating: val[0] })}
            min={0}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span><span>5★</span>
          </div>
        </div>

        {/* Availability */}
        <div className={sectionClass}>
          <label className={labelClass}>Availability</label>
          <div className="space-y-2">
            {[
              { id: 'available', label: 'Available' },
              { id: 'booked', label: 'Booked' },
              { id: 'on_vacation', label: 'On Vacation' },
            ].map(({ id, label }) => (
              <div key={id} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={(draft.availability || []).includes(id)}
                  onCheckedChange={() => handleAvailabilityChange(id)}
                  className="border-slate-400"
                />
                <label htmlFor={id} className="text-sm text-slate-800 cursor-pointer">{label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
          <Button
            onClick={handleSubmit}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}