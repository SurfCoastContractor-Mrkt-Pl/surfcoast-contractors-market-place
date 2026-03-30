import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Save, X, Tag } from 'lucide-react';

export default function SaveMockupModal({ parts, gameId, onSaved, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your mockup.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const user = await base44.auth.me();
      if (!user) {
        setError('You must be logged in to save mockups.');
        setSaving(false);
        return;
      }
      const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
      await base44.entities.PlumbingMockup.create({
        title: title.trim(),
        description: description.trim(),
        trade_type: 'plumbing',
        parts_json: JSON.stringify(parts),
        created_by_email: user.email,
        is_public: isPublic,
        tags: tagsArr,
        game_id: gameId || null
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError('Failed to save mockup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg text-slate-900">Save Mockup</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Title *</label>
            <Input
              placeholder="e.g. Bathroom Sink P-Trap Replacement"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
            <Textarea
              placeholder="Describe the problem, what you found, parts used..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Tags (comma-separated)
            </label>
            <Input
              placeholder="e.g. p-trap, leak, bathroom, sink"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="is-public" className="text-sm text-slate-600">
              Share publicly with other contractors
            </label>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
            <strong>{parts?.length || 0} parts</strong> will be saved in this mockup
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Mockup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}