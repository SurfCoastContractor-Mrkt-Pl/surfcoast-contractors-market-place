import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, DollarSign, X } from 'lucide-react';

const TRADE_CATEGORIES = [
  'electrician', 'plumber', 'carpenter', 'hvac', 'mason',
  'roofer', 'painter', 'welder', 'tiler', 'landscaper'
];

export default function JobFeedFilter({ jobs = [] }) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [trade, setTrade] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  // Filter jobs based on criteria
  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !search || 
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesLocation = !location || 
        job.location?.toLowerCase().includes(location.toLowerCase());
      
      const matchesTrade = !trade || job.trade_needed === trade;
      
      const min = budgetMin ? parseFloat(budgetMin) : 0;
      const max = budgetMax ? parseFloat(budgetMax) : Infinity;
      const jobMin = job.budget_min || 0;
      const jobMax = job.budget_max || Infinity;
      const matchesBudget = (jobMin >= min || !budgetMin) && (jobMax <= max || !budgetMax);
      
      return matchesSearch && matchesLocation && matchesTrade && matchesBudget;
    });
  }, [jobs, search, location, trade, budgetMin, budgetMax]);

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setTrade('');
    setBudgetMin('');
    setBudgetMax('');
  };

  const hasActiveFilters = search || location || trade || budgetMin || budgetMax;

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">Search Jobs</label>
        <Input
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <Input
            placeholder="City or region..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Trade Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Trade
          </label>
          <Select value={trade} onValueChange={setTrade}>
            <SelectTrigger>
              <SelectValue placeholder="All trades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All trades</SelectItem>
              {TRADE_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Budget Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Min Budget
          </label>
          <Input
            type="number"
            placeholder="Minimum..."
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
          />
        </div>

        {/* Max Budget Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Max Budget
          </label>
          <Input
            type="number"
            placeholder="Maximum..."
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}

      {/* Results Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">{filtered.length}</span> job{filtered.length !== 1 ? 's' : ''} match{filtered.length !== 1 ? '' : 'es'} your criteria
          {hasActiveFilters && ' • Filters active'}
        </p>
      </div>

      {/* Job Results */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(job => (
            <div key={job.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {job.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}
                    {job.trade_needed && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Briefcase className="w-3 h-3" />
                        {job.trade_needed}
                      </span>
                    )}
                    {(job.budget_min || job.budget_max) && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <DollarSign className="w-3 h-3" />
                        ${job.budget_min || '0'} - ${job.budget_max || '∞'}
                      </span>
                    )}
                  </div>
                </div>
                <Button className="text-white bg-blue-600 hover:bg-blue-700 shrink-0">
                  View Details
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No jobs match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}