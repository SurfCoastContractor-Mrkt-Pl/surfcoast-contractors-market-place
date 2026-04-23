import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Global set to deduplicate section_viewed events across the entire page session.
// This prevents multiple components calling useScrollTracking from hammering the
// analytics batch endpoint simultaneously, which was causing 429 rate-limit errors.
const _trackedSections = new Set();

export default function useScrollTracking(sectionName) {
  const ref = useRef(null);

  useEffect(() => {
    // If this section was already tracked in this page session, skip entirely
    if (_trackedSections.has(sectionName)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !_trackedSections.has(sectionName)) {
          _trackedSections.add(sectionName);
          observer.unobserve(entry.target);

          // Stagger the analytics call slightly so multiple sections entering view
          // at the same time don't all fire simultaneously into the batch endpoint
          setTimeout(() => {
            try {
              base44.analytics.track({
                eventName: 'section_viewed',
                properties: {
                  section: sectionName,
                  page: window.location.pathname,
                },
              });
            } catch (_) {
              // non-fatal
            }
          }, Math.random() * 800); // spread up to 800ms
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}