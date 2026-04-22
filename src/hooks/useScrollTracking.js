import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Tracks when a named section scrolls into view.
 * Previously the IntersectionObserver fired but never recorded anything —
 * the sectionName was unused and no analytics call was made. Fixed to
 * actually track the engagement event so visit duration is measured correctly.
 */
export default function useScrollTracking(sectionName) {
  const ref = useRef(null);
  const tracked = useRef(false); // prevent duplicate events on re-renders

  useEffect(() => {
    tracked.current = false; // reset when sectionName changes

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          observer.unobserve(entry.target);

          // Actually record the engagement — previously this was silently dropped
          try {
            base44.analytics.track({
              eventName: 'section_viewed',
              properties: {
                section: sectionName,
                page: window.location.pathname,
              },
            });
          } catch (_) {
            // non-fatal — don't let analytics errors affect UI
          }
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}