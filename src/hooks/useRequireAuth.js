import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Checks if the user is authenticated and redirects to login if not.
 * Returns { user, loading } for use in protected pages.
 * 
 * @param {string} nextUrl - URL to redirect back to after login (defaults to current path)
 */
export function useRequireAuth(nextUrl) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const u = await base44.auth.me();
        if (!u) {
          base44.auth.redirectToLogin(nextUrl || window.location.pathname);
          return;
        }
        if (mounted) {
          setUser(u);
          setLoading(false);
        }
      } catch (err) {
        base44.auth.redirectToLogin(nextUrl || window.location.pathname);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [nextUrl]);

  return { user, loading };
}