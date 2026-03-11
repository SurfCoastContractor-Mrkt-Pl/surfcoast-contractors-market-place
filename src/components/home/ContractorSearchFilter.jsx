import React, { useState, useMemo } from 'react';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ContractorCard from '@/components/contractors/ContractorCard';

export default function ContractorSearchFilter({ contractors = [] }) {
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Get unique locations and categories from contractors
  const locations = useMemo(() => {
    const unique = [...new Set(contractors.map(c => c.location).filter(Boolean))];
    return unique.sort();
  }, [contractors]);

  const categories = useMemo(() => {
    const unique = [...new Set(
      contractors
        .filter(c => c.contractor_type === 'trade_specific')
        .map(c => c.trade_specialty)
        .filter(Boolean)
    )];
    return unique.sort();
  }, [contractors]);

  // Filter and sort contractors by rating
  const filteredContractors = useMemo(() => {
    return contractors
      .filter(contractor => {
        const matchesName = !searchName || 
          contractor.name.toLowerCase().includes(searchName.toLowerCase());
        
        const matchesCategory = !selectedCategory || 
          contractor.trade_specialty === selectedCategory;
        
        const matchesLocation = !selectedLocation || 
          contractor.location === selectedLocation;

        return matchesName && matchesCategory && matchesLocation;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Sort by rating descending
  }, [contractors, searchName, selectedCategory, selectedLocation]);

  const hasActiveFilters = searchName || selectedCategory || selectedLocation;
  const resultCount = filteredContractors.length;

  const handleClearFilters = () => {
    setSearchName('');
    setSelectedCategory('');
    setSelectedLocation('');
    setShowResults(false);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Find Contractors</h2>
          <p className="text-slate-600">Search by name, service, or location</p>
        </div>

        {/* Search and Filter Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Name Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Contractor name..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setShowResults(true);
              }}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setShowResults(true);
              }}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').charAt(0).toUpperCase() + cat.replace(/_/g, ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setShowResults(true);
              }}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-sm text-amber-900">
              {resultCount} contractor{resultCount !== 1 ? 's' : ''} found
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div>
            {filteredContractors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContractors.map(contractor => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No contractors found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your search filters</p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        )}

        {!showResults && (
          <div className="text-center py-12 text-slate-500">
            <p>Use the search and filter options above to find contractors</p>
          </div>
        )}
      </div>
    </div>
  );
}