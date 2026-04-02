import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Database, Loader2, ExternalLink, CheckCircle } from 'lucide-react';

export default function NotionProjectSync({ scope }) {
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(null);

  const handleSyncToNotion = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('syncToNotion', {
        action: 'createProject',
        scopeId: scope.id,
        title: scope.job_title,
        description: scope.scope_summary,
        status: scope.status,
      });
      setSynced(result);
    } catch (error) {
      console.error('Notion sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-gray-900">Project Management</h3>
      </div>

      {!synced ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Create a project page in Notion for collaborative tracking and milestones.
          </p>
          <button
            onClick={handleSyncToNotion}
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Create in Notion
              </>
            )}
          </button>
        </>
      ) : (
        <div className="p-4 bg-white rounded-lg border border-green-200 space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Project created in Notion!
          </div>
          <a
            href={`https://notion.so/${synced.pageId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
          >
            Open in Notion
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-xs text-gray-500">
            Manage milestones, track progress, and collaborate with team members in Notion.
          </p>
        </div>
      )}
    </div>
  );
}