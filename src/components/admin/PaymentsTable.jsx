import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, CheckSquare, Square, XCircle } from 'lucide-react';
import AdminTableFilters from './AdminTableFilters';

export default function PaymentsTable({ payments, isLoading }) {
  const [filters, setFilters] = useState({ search: '', status: undefined });
  const [sortField, setSortField] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.update(id, { status: 'confirmed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-payments'] }),
  });

  const denyMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.update(id, { status: 'expired' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-payments'] }),
  });

  const filteredAndSorted = useMemo(() => {
    let data = [...payments];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(p =>
        p.payer_name.toLowerCase().includes(search) ||
        p.payer_email.toLowerCase().includes(search) ||
        p.purpose?.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      data = data.filter(p => p.status === filters.status);
    }

    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'created_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [payments, filters, sortField, sortOrder]);

  const pendingInView = filteredAndSorted.filter(p => p.status === 'pending');
  const allPendingSelected = pendingInView.length > 0 && pendingInView.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingInView.map(p => p.id)));
    }
  };

  const handleBulkConfirm = async () => {
    const ids = [...selectedIds];
    for (const id of ids) {
      await confirmMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleBulkDeny = async () => {
    const ids = [...selectedIds];
    for (const id of ids) {
      await denyMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <AdminTableFilters
        filters={{ ...filters, statusOptions: ['pending', 'confirmed'], sortOptions: [
          { value: 'created_date', label: 'Date' },
          { value: 'amount', label: 'Amount' },
          { value: 'payer_name', label: 'Name' }
        ]}}
        onFilterChange={setFilters}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        searchPlaceholder="Search by name, email, or purpose..."
      />

      {/* Bulk Actions Bar */}
      {pendingInView.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            {allPendingSelected
              ? <CheckSquare className="w-4 h-4 text-blue-600" />
              : <Square className="w-4 h-4" />
            }
            {allPendingSelected ? 'Deselect All' : `Select All Pending (${pendingInView.length})`}
          </button>

          {someSelected && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={handleBulkConfirm}
                disabled={confirmMutation.isPending || denyMutation.isPending}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Confirm Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                onClick={handleBulkDeny}
                disabled={confirmMutation.isPending || denyMutation.isPending}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Deny Selected
              </Button>
            </>
          )}
        </div>
      )}

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-10 text-slate-400">No payments found.</div>
      ) : (
        <div className="space-y-2">
          {filteredAndSorted.map(p => (
            <Card key={p.id} className={`p-4 transition-colors ${selectedIds.has(p.id) ? 'ring-2 ring-blue-400 bg-blue-50/30' : ''}`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Checkbox for pending only */}
                  {p.status === 'pending' ? (
                    <button onClick={() => toggleSelect(p.id)}>
                      {selectedIds.has(p.id)
                        ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                        : <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      }
                    </button>
                  ) : (
                    <div className="w-4 h-4 shrink-0" />
                  )}
                  {p.status === 'confirmed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 text-sm">{p.payer_name}</div>
                    <div className="text-xs text-slate-500">{p.payer_email}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.purpose}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <Badge className={p.payer_type === 'contractor' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}>
                    {p.payer_type}
                  </Badge>
                  <span className="font-bold text-slate-900 text-sm">${(p.amount || 0).toFixed(2)}</span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(p.created_date).toLocaleDateString()}</span>
                  {p.status === 'pending' ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      onClick={() => confirmMutation.mutate(p.id)}
                      disabled={confirmMutation.isPending}
                    >
                      Confirm
                    </Button>
                  ) : p.status === 'expired' ? (
                    <Badge className="bg-red-100 text-red-700 text-xs">Denied</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 text-xs">Confirmed</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}