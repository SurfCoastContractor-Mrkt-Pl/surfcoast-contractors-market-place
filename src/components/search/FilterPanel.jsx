import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

const TRADES = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC Technician' },
  { id: 'mason', name: 'Mason' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'painter', name: 'Painter' },
  { id: 'welder', name: 'Welder' },
  { id: 'tiler', name: 'Tiler' },
  { id: 'landscaper', name: 'Landscaper' },
  { id: 'other', name: 'Other' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'available', name: 'Available' },
  { id: 'booked', name: 'Booked' },
  { id: 'on_vacation', name: 'On Vacation' },
];

const SERVICES = [
  { id: 'freelance_writer', name: 'Freelance Writer' },
  { id: 'freelance_designer', name: 'Freelance Designer' },
  { id: 'freelance_developer', name: 'Freelance Developer' },
  { id: 'consultant', name: 'Consultant' },
  { id: 'virtual_assistant', name: 'Virtual Assistant' },
  { id: 'handyman', name: 'Handyman' },
  { id: 'appliance_repair', name: 'Appliance Repair' },
];

export default function FilterPanel({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  tradeFilter,
  setTradeFilter,
  lineOfWorkFilter,
  setLineOfWorkFilter,
  ratingFilter,
  setRatingFilter,
  availabilityFilter,
  setAvailabilityFilter,
  onClearFilters,
  hasActiveFilters,
  searchRadius,
  setSearchRadius,
  userLocation,
}) {
  const [pendingRadius, setPendingRadius] = useState(searchRadius);

  const handleRemoveFilter = (filterType) => {
    const setters = {
      search: () => setSearchQuery(''),
      type: () => setTypeFilter(''),
      trade: () => setTradeFilter(''),
      service: () => setLineOfWorkFilter(''),
      rating: () => setRatingFilter(''),
      availability: () => setAvailabilityFilter(''),
    };
    setters[filterType]?.();
  };

  return (
    <div className="space-y-6">
      {/* Location & Radius Section */}
      {userLocation && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">
                  Search Radius: <span className="text-amber-600 font-semibold">{pendingRadius} miles</span>
                </label>
                <Button
                  size="sm"
                  onClick={() => setSearchRadius(pendingRadius)}
                  disabled={pendingRadius === searchRadius}
                  className="text-xs h-7 px-3 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40"
                >
                  Apply
                </Button>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={pendingRadius}
                onChange={(e) => setPendingRadius(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>5 mi</span>
                <span>100 mi</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-slate-500" />
          <span className="font-medium text-slate-700">Filters</span>
        </div>

        {/* Filter Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Types</SelectItem>
              <SelectItem value="trade_specific">Trade Specific</SelectItem>
              <SelectItem value="general">General Contractor</SelectItem>
            </SelectContent>
          </Select>

          {/* Trade Specialty */}
          <Select value={tradeFilter} onValueChange={setTradeFilter} disabled={typeFilter === 'general'}>
            <SelectTrigger>
              <SelectValue placeholder="Trade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Trades</SelectItem>
              {TRADES.map(trade => (
                <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rating */}
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Ratings</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ 5.0</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ 4.0+</SelectItem>
              <SelectItem value="3">⭐⭐⭐ 3.0+</SelectItem>
            </SelectContent>
          </Select>

          {/* Availability */}
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Status</SelectItem>
              {AVAILABILITY_OPTIONS.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Filter (General Contractors only) */}
        {typeFilter === 'general' && (
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Service Type</label>
            <Select value={lineOfWorkFilter} onValueChange={setLineOfWorkFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Services</SelectItem>
                {SERVICES.map(service => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500">Active:</span>
              {searchQuery && (
                <Badge className="gap-1 bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer" onClick={() => handleRemoveFilter('search')}>
                  🔍 {searchQuery}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {typeFilter && (
                <Badge className="gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer" onClick={() => handleRemoveFilter('type')}>
                  {typeFilter === 'trade_specific' ? 'Trade Specific' : 'General'}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {tradeFilter && (
                <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer" onClick={() => handleRemoveFilter('trade')}>
                  {TRADES.find(t => t.id === tradeFilter)?.name}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {lineOfWorkFilter && (
                <Badge className="gap-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 cursor-pointer" onClick={() => handleRemoveFilter('service')}>
                  {SERVICES.find(s => s.id === lineOfWorkFilter)?.name}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {ratingFilter && (
                <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer" onClick={() => handleRemoveFilter('rating')}>
                  ⭐ {ratingFilter}+
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {availabilityFilter && (
                <Badge className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer" onClick={() => handleRemoveFilter('availability')}>
                  {AVAILABILITY_OPTIONS.find(o => o.id === availabilityFilter)?.name}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-slate-600 hover:text-slate-900 ml-2">
                Clear all
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}