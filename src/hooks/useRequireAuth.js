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
    base44.auth.me()
      .then((u) => {
        if (!u) {
          base44.auth.redirectToLogin(nextUrl || window.location.pathname);
          return;
        }
        setUser(u);
      })
      .catch(() => {
        base44.auth.redirectToLogin(nextUrl || window.location.pathname);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}