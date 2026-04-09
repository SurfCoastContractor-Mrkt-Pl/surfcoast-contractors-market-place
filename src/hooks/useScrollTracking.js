import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function useScrollTracking(sectionName) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          base44.analytics.track({
            eventName: 'section_viewed',
            properties: { section: sectionName }
          }).catch(() => {}); // Silent fail if analytics unavailable
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}