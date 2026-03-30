import React, { useState, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, AlertCircle, Mail, Phone, MapPin, Edit2, Trash2, Filter } from 'lucide-react';

export default function ClientDatabasePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('-created_date');
  const queryClient = useQueryClient();

  // Fetch all clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', sortBy],
    queryFn: async () => {
      return await base44.entities.CustomerProfile.filter({}, sortBy, 500);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomerProfile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });

  // Filter and search
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm);
      
      const matchesLocation = !filterLocation || client.location === filterLocation;
      
      return matchesSearch && matchesLocation;
    });
  }, [clients, searchTerm, filterLocation]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    return [...new Set(clients.map(c => c.location).filter(Boolean))].sort();
  }, [clients]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Delete this client profile?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="-created_date">Newest First</option>
            <option value="created_date">Oldest First</option>
            <option value="full_name">Name (A-Z)</option>
          </select>
        </div>

        {locations.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <span className="text-sm text-slate-600 ml-auto">
              {filteredClients.length} of {clients.length}
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">Failed to load clients</p>
        </div>
      )}

      {/* Empty State */}
      {filteredClients.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No clients found</p>
        </div>
      )}

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{client.full_name}</h3>
                <p className="text-sm text-slate-600">{client.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 hover:bg-slate-100 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {client.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{client.location}</span>
                </div>
              )}
              {client.total_jobs_posted > 0 && (
                <div className="text-slate-600">
                  <span className="font-medium">{client.total_jobs_posted}</span> jobs posted
                </div>
              )}
              {client.property_type && (
                <div className="text-slate-600">
                  <span className="capitalize">{client.property_type.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>

            {client.bio && (
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{client.bio}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}