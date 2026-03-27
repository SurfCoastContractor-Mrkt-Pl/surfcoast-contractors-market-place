import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import NotionIntegrationPanel from '@/components/notion/NotionIntegrationPanel';

export default function NotionHub() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">Please sign in to access the Notion Hub.</p>
        <button
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700"
          onClick={() => base44.auth.redirectToLogin()}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <NotionIntegrationPanel isAdmin={user.role === 'admin'} />
      </div>
    </div>
  );
}