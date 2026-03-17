import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, User, Loader2 } from 'lucide-react';

export default function AuthTopBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
      {user ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
              {user.full_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">{user.full_name || 'User'}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => base44.auth.logout()}
            className="border-slate-300 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Log Out</span>
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          onClick={() => base44.auth.redirectToLogin()}
          style={{ backgroundColor: '#d4a843', color: '#1a1a1a' }}
          className="font-semibold hover:opacity-90"
        >
          <LogIn className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Login</span>
          <span className="sm:hidden">Sign In</span>
        </Button>
      )}
    </div>
  );
}