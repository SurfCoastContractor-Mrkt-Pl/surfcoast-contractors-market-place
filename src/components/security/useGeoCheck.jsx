import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * useGeoCheck — runs once on mount, silently redirects non-US visitors to /RegionBlocked
 */
export default function useGeoCheck() {
  useEffect(() => {
    // Don't block the admin dashboard
    if (window.location.pathname.includes('AdminDashboard') || 
        window.location.pathname.includes('RegionBlocked')) {
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
        }
      } catch {
        // Fail open — don't block if check errors
      }
    };

    check();
  }, []);
}