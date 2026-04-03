import React from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminGuard({ children }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}