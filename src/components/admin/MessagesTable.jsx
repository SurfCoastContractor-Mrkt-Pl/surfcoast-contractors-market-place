import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminTableFilters from './AdminTableFilters';

export default function MessagesTable({ messages, isLoading }) {
  const [filters, setFilters] = useState({ search: '', readStatus: undefined });
  const [sortField, setSortField] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredAndSorted = useMemo(() => {
    let data = [...messages];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(m =>
        m.sender_name.toLowerCase().includes(search) ||
        m.sender_email.toLowerCase().includes(search) ||
        m.recipient_name.toLowerCase().includes(search) ||
        m.body.toLowerCase().includes(search)
      );
    }

    if (filters.readStatus !== undefined) {
      data = data.filter(m => (m.read ? 'read' : 'unread') === filters.readStatus);
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
  }, [messages, filters, sortField, sortOrder]);

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
        filters={{ ...filters, sortOptions: [
          { value: 'created_date', label: 'Date' },
          { value: 'sender_name', label: 'Sender' }
        ]}}
        onFilterChange={setFilters}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        searchPlaceholder="Search by name, email, or message content..."
      />

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-10 text-slate-400">No messages found.</div>
      ) : (
        <div className="space-y-2">
          {filteredAndSorted.map(m => (
            <Card key={m.id} className={`p-4 border ${m.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 text-sm">{m.sender_name}</span>
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="font-medium text-slate-700 text-sm">{m.recipient_name}</span>
                    <Badge className={m.sender_type === 'contractor' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'} variant="sm">
                      {m.sender_type}
                    </Badge>
                    {!m.read && <Badge className="bg-blue-500 text-white text-xs">Unread</Badge>}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(m.created_date).toLocaleDateString()}</span>
                </div>
                {m.subject && <div className="text-xs text-slate-500 font-medium">Subject: {m.subject}</div>}
                <div className="text-sm text-slate-600 line-clamp-2">{m.body}</div>
                <div className="text-xs text-slate-400 flex gap-3">
                  <span>{m.sender_email}</span>
                  <span>·</span>
                  <span>{new Date(m.created_date).toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}