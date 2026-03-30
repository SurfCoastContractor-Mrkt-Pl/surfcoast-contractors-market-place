import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FolderOpen, Trash2, Globe, Lock, Wrench, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function MockupLibrary({ onLoad, onClose }) {
  const [tab, setTab] = useState('mine');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
    staleTime: 60000
  });

  const { data: myMockups = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-mockups', user?.email],
    enabled: !!user,
    queryFn: () => base44.entities.PlumbingMockup.filter({ created_by_email: user.email }, '-created_date', 50)
  });

  const { data: publicMockups = [], isLoading: loadingPublic } = useQuery({
    queryKey: ['public-mockups'],
    queryFn: () => base44.entities.PlumbingMockup.filter({ is_public: true }, '-created_date', 50)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlumbingMockup.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-mockups'] })
  });

  const mockups = tab === 'mine' ? myMockups : publicMockups;
  const isLoading = tab === 'mine' ? loadingMine : loadingPublic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg text-slate-900">Saved Mockups</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5">
          {['mine', 'public'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'mine' ? 'My Mockups' : 'Public Mockups'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5">
          {!user && tab === 'mine' ? (
            <div className="text-center py-12 text-slate-500">
              <p>Please log in to view your saved mockups.</p>
              <Button className="mt-4" onClick={() => base44.auth.redirectToLogin()}>Log In</Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : mockups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Wrench className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No mockups yet</p>
              <p className="text-sm mt-1">Build something and save it to reference later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockups.map(mockup => {
                let partCount = 0;
                try { partCount = JSON.parse(mockup.parts_json)?.length || 0; } catch {}
                return (
                  <Card key={mockup.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{mockup.title}</h3>
                          {mockup.is_public
                            ? <Globe className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            : <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          }
                        </div>
                        {mockup.description && (
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">{mockup.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {partCount} parts
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {mockup.created_date ? format(new Date(mockup.created_date), 'MMM d, yyyy') : 'Unknown'}
                          </span>
                        </div>
                        {mockup.tags?.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {mockup.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => {
                            try {
                              const parts = JSON.parse(mockup.parts_json);
                              onLoad?.(parts, mockup);
                            } catch {}
                          }}
                        >
                          Load
                        </Button>
                        {tab === 'mine' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteMutation.mutate(mockup.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}