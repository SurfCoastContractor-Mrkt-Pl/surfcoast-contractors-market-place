import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const GEO_CHECK_KEY = 'sc_geo_checked';

/**
 * useGeoCheck — runs once per session, silently redirects non-US visitors to /RegionBlocked.
 * Uses sessionStorage to avoid re-checking on every page navigation (prevents false redirects
 * on post-login route changes where auth headers may not be ready yet).
 */
export default function useGeoCheck() {
  useEffect(() => {
    // Don't block these paths
    if (
      window.location.pathname.includes('AdminDashboard') ||
      window.location.pathname.includes('RegionBlocked')
    ) {
      return;
    }

    // Already checked this session — skip to avoid false positives on navigation
    if (sessionStorage.getItem(GEO_CHECK_KEY) === 'ok') {
      return;
    }

    const check = async () => {
      try {
        const { data } = await base44.functions.invoke('geoCheck', {
          path: window.location.pathname,
        });

        if (data && data.allowed === false) {
          const params = new URLSearchParams({
            country: data.countryName || data.country || 'Unknown',
            code: data.country || '',
          });
          window.location.href = createPageUrl('RegionBlocked') + '?' + params.toString();
        } else {
          // Mark as checked for the rest of this session
          sessionStorage.setItem(GEO_CHECK_KEY, 'ok');
        }
      } catch {
        // Fail open — don't block if check errors
        sessionStorage.setItem(GEO_CHECK_KEY, 'ok');
      }
    };

    check();
  }, []);
}