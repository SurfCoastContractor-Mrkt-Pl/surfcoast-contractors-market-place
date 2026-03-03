import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, X, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ContractorCard from '@/components/contractors/ContractorCard';
import LocationSelector from '@/components/location/LocationSelector';
import { calculateDistance, geocodeLocation } from '@/components/location/geolocationUtils';
import { createPageUrl } from '@/utils';

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

export default function Contractors() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [isContractor, setIsContractor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [contractorDistances, setContractorDistances] = useState({});
  const [searchRadius, setSearchRadius] = useState(35);

  const urlParams = new URLSearchParams(window.location.search);
  const initialTrade = urlParams.get('trade') || '';
  const initialType = urlParams.get('type') || '';

  // Check if user is authenticated and contractor type
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        setUserEmail(user.email);
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors && contractors.length > 0) {
          setIsContractor(true);
        }
      } finally {
        setLoading(false);
      }
    };
    checkUserType();
  }, []);

  useEffect(() => {
    if (initialType) setTypeFilter(initialType);
    if (initialTrade) setTradeFilter(initialTrade);
  }, [initialType, initialTrade]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Redirect contractors away
  if (isContractor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Contractors Only</h2>
          <p className="text-slate-600 mb-6">This section is for customers only. As a contractor, you can view jobs posted by customers.</p>
          <Button onClick={() => navigate(createPageUrl('Jobs'))} className="bg-amber-500 hover:bg-amber-600">
            Browse Jobs for Contractors
          </Button>
        </Card>
      </div>
    );
  }

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => base44.entities.Contractor.list('-rating'),
  });

  // Calculate distances when location changes
  const handleLocationChange = async (location) => {
    setUserLocation(location);
    if (contractors) {
      const distances = {};
      for (const c of contractors) {
        if (c.location) {
          try {
            const contractorCoords = await geocodeLocation(c.location);
            if (contractorCoords) {
              const dist = calculateDistance(
                location.lat,
                location.lon,
                contractorCoords.lat,
                contractorCoords.lon
              );
              distances[c.id] = dist;
            }
          } catch (error) {
            console.error('Distance calc error:', error);
          }
        }
      }
      setContractorDistances(distances);
    }
  };

  const filteredContractors = useMemo(() => {
    if (!contractors) return [];
    
    let results = contractors.filter(c => {
      const matchesSearch = !searchQuery || 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !typeFilter || 
        (typeFilter === 'general' && c.contractor_type === 'general') ||
        (typeFilter === 'trade_specific' && c.contractor_type === 'trade_specific');
      
      const matchesTrade = !tradeFilter || c.trade_specialty === tradeFilter;
      
      const matchesAvailable = !availableOnly || c.available;

      const matchesStatus = !statusFilter || c.availability_status === statusFilter;

      // Filter by radius if user location is set
      const distance = contractorDistances[c.id];
      const matchesRadius = !userLocation || (distance !== undefined && distance <= searchRadius);
      
      return matchesSearch && matchesType && matchesTrade && matchesAvailable && matchesStatus && matchesRadius;
    });

    // Add distance info if user location is set
    if (userLocation) {
      results = results.map(c => ({
        ...c,
        distance: contractorDistances[c.id]
      }));
    }

    return results;
  }, [contractors, searchQuery, typeFilter, tradeFilter, availableOnly, statusFilter, userLocation, contractorDistances, searchRadius]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setTradeFilter('');
    setAvailableOnly(false);
    setStatusFilter('');
  };

  const hasActiveFilters = searchQuery || typeFilter || tradeFilter || availableOnly || statusFilter;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Contractors</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Browse skilled professionals for your construction project
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Your Location</span>
          </div>
          <LocationSelector onLocationChange={handleLocationChange} />
          
          {userLocation && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">
                  Search Radius: <span className="text-amber-600 font-semibold">{searchRadius} miles</span>
                </label>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>5 mi</span>
                <span>100 mi</span>
              </div>
            </div>
          )}
        </div>

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
                placeholder="Search by name or location..."
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="on_vacation">On Vacation</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant={availableOnly ? "default" : "outline"}
              className={availableOnly ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setAvailableOnly(!availableOnly)}
            >
              {availableOnly ? '✓ Available Now' : 'Available Now'}
            </Button>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {typeFilter && typeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {typeFilter === 'general' ? 'General' : 'Trade Specific'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('')} />
                </Badge>
              )}
              {tradeFilter && tradeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {trades.find(t => t.id === tradeFilter)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTradeFilter('')} />
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="gap-1">
                  {statusFilter === 'available' && 'Available'}
                  {statusFilter === 'booked' && 'Booked'}
                  {statusFilter === 'on_vacation' && 'On Vacation'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('')} />
                </Badge>
              )}
              {availableOnly && (
                <Badge variant="secondary" className="gap-1">
                  Available
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setAvailableOnly(false)} />
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
            <Users className="w-5 h-5" />
            <span>{filteredContractors.length} contractors found</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredContractors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map(contractor => (
              <div key={contractor.id} className="relative">
                {userLocation && contractor.distance !== undefined && (
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    {contractor.distance.toFixed(1)} mi
                  </div>
                )}
                <ContractorCard contractor={contractor} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No contractors found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your filters or search query</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}