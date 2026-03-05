import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function AdminTableFilters({ filters, onFilterChange, sortField, sortOrder, onSortChange, searchPlaceholder = 'Search...' }) {
  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        {filters.status !== undefined && (
          <Select value={filters.status || 'all'} onValueChange={(value) => onFilterChange({ ...filters, status: value === 'all' ? undefined : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Array.isArray(filters.statusOptions) && filters.statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Type Filter */}
        {filters.type !== undefined && (
          <Select value={filters.type || 'all'} onValueChange={(value) => onFilterChange({ ...filters, type: value === 'all' ? undefined : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600 font-medium">Sort by:</span>
        <Select value={sortField || 'created_date'} onValueChange={(value) => onSortChange(value, sortOrder)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(filters.sortOptions) && filters.sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-10 px-0"
        >
          {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}