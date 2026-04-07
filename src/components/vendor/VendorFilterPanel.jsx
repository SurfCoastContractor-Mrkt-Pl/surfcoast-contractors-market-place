import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X, Sliders } from 'lucide-react';



export default function VendorFilterPanel({ filters, onFiltersChange, onClose, isOpen }) {
  const handleRatingChange = (value) => {
    onFiltersChange({ ...filters, minRating: value[0] });
  };



  const handleAvailabilityChange = (status) => {
    const availability = filters.availability || [];
    const updated = availability.includes(status)
      ? availability.filter(a => a !== status)
      : [...availability, status];
    onFiltersChange({ ...filters, availability: updated });
  };

  const resetFilters = () => {
    onFiltersChange({
      marketType: 'all',
      location: '',
      category: 'all',
      minRating: 0,
      availability: []
    });
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-80 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-200 ease-in-out overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:translate-x-0 lg:h-auto lg:shadow-none`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Market Type */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 block mb-3">Market Type</label>
          <Select value={filters.marketType || 'all'} onValueChange={(value) => onFiltersChange({ ...filters, marketType: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="farmers_market">Farmers Market</SelectItem>
              <SelectItem value="swap_meet">Swap Meet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 block mb-3">Location</label>
          <Input
            placeholder="City, State"
            value={filters.location || ''}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 block mb-3">Category</label>
          <Select value={filters.category || 'all'} onValueChange={(value) => onFiltersChange({ ...filters, category: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="sports_equipment">Sports Equipment</SelectItem>
              <SelectItem value="books_media">Books & Media</SelectItem>
              <SelectItem value="home_decor">Home Decor</SelectItem>
              <SelectItem value="clothing_accessories">Clothing & Accessories</SelectItem>
              <SelectItem value="collectibles">Collectibles</SelectItem>
              <SelectItem value="handmade_crafts">Handmade Crafts</SelectItem>
              <SelectItem value="vintage_antiques">Vintage & Antiques</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Rating */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 block mb-3">Minimum Rating</label>
          <div className="flex items-center gap-3">
            <Slider
              value={[filters.minRating || 0]}
              onValueChange={handleRatingChange}
              min={0}
              max={5}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm font-medium text-slate-700 w-10">{(filters.minRating || 0).toFixed(1)}★</span>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 block mb-3">Availability</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="available"
                checked={(filters.availability || []).includes('available')}
                onCheckedChange={() => handleAvailabilityChange('available')}
              />
              <label htmlFor="available" className="text-sm text-slate-700 cursor-pointer">
                Available
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="booked"
                checked={(filters.availability || []).includes('booked')}
                onCheckedChange={() => handleAvailabilityChange('booked')}
              />
              <label htmlFor="booked" className="text-sm text-slate-700 cursor-pointer">
                Booked
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="on_vacation"
                checked={(filters.availability || []).includes('on_vacation')}
                onCheckedChange={() => handleAvailabilityChange('on_vacation')}
              />
              <label htmlFor="on_vacation" className="text-sm text-slate-700 cursor-pointer">
                On Vacation
              </label>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}