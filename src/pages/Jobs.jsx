import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase, X, Plus } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';

const trades = [
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

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
  });

  // Fetch all work_scheduled payments to know which job IDs are closed
  const { data: scheduledPayments } = useQuery({
    queryKey: ['scheduled-payments'],
    queryFn: () => base44.entities.Payment.filter({ status: 'work_scheduled' }),
  });

  const scheduledJobIds = useMemo(() => {
    if (!scheduledPayments) return new Set();
    return new Set(scheduledPayments.map(p => p.contractor_id).filter(Boolean));
  }, [scheduledPayments]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    // Exclude jobs that have been marked as work scheduled
    
    return jobs.filter(job => {
      if (scheduledJobIds.has(job.id)) return false;

      const matchesSearch = !searchQuery || 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !typeFilter || 
        typeFilter === 'all' ||
        job.contractor_type_needed === typeFilter;
      
      const matchesTrade = !tradeFilter || 
        tradeFilter === 'all' ||
        job.trade_needed === tradeFilter;
      
      const matchesUrgency = !urgencyFilter || 
        urgencyFilter === 'all' ||
        job.urgency === urgencyFilter;
      
      return matchesSearch && matchesType && matchesTrade && matchesUrgency;
    });
  }, [jobs, searchQuery, typeFilter, tradeFilter, urgencyFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setTradeFilter('');
    setUrgencyFilter('');
  };

  const hasActiveFilters = searchQuery || typeFilter || tradeFilter || urgencyFilter;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Job Listings</h1>
              <p className="text-lg text-slate-300">
                Find your next construction project
              </p>
            </div>
            <Link to={createPageUrl('PostJob')}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Plus className="w-5 h-5 mr-2" />
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Filters</span>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Contractor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trade_specific">Trade Specific</SelectItem>
                <SelectItem value="general">General Contractor</SelectItem>
                <SelectItem value="either">Either</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trade Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade.id} value={trade.id}>{trade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="urgent">🔥 Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              <span className="text-sm text-slate-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {typeFilter && typeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {typeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('')} />
                </Badge>
              )}
              {tradeFilter && tradeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {trades.find(t => t.id === tradeFilter)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTradeFilter('')} />
                </Badge>
              )}
              {urgencyFilter && urgencyFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {urgencyFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgencyFilter('')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-amber-600">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="w-5 h-5" />
            <span>{filteredJobs.length} jobs found</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your filters or check back later</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}