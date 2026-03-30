import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Save, FolderOpen, Trash2, Globe, Lock } from 'lucide-react';

export default function MockupManager({ user, currentSceneState, tradeType, gameId, onLoad, onClose }) {
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    loadMockups();
  }, []);

  const loadMockups = async () => {
    setLoading(true);
    const results = await base44.entities.PlumbingMockup.filter({ trade_type: tradeType });
    setMockups(results);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    await base44.entities.PlumbingMockup.create({
      name: name.trim(),
      description,
      creator_email: user.email,
      trade_game_id: gameId,
      scene_state_json: JSON.stringify(currentSceneState || {}),
      trade_type: tradeType || 'plumbing',
      is_public: isPublic,
    });
    setName('');
    setDescription('');
    await loadMockups();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.PlumbingMockup.delete(id);
    setMockups(prev => prev.filter(m => m.id !== id));
  };

  const handleLoad = (mockup) => {
    try {
      const state = JSON.parse(mockup.scene_state_json || '{}');
      onLoad(state, mockup.name);
    } catch {
      onLoad({}, mockup.name);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-slate-800">Plumbing Mockups</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Save current scene */}
          {user && currentSceneState && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-3">Save Current Scene</p>
              <div className="space-y-2">
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Mockup name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Notes (optional)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded" />
                    Share publicly
                  </label>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Saved mockups */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Saved Mockups</p>
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
            ) : mockups.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No mockups saved yet.</p>
            ) : (
              <div className="space-y-2">
                {mockups.map(m => (
                  <div key={m.id} className="flex items-start justify-between gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-slate-800 truncate">{m.name}</p>
                        {m.is_public
                          ? <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          : <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        }
                      </div>
                      {m.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{m.description}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleLoad(m)}>
                        <FolderOpen className="w-3 h-3" /> Load
                      </Button>
                      {user?.email === m.creator_email && (
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 border-red-200" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}