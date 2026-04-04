/**
 * Global Lazy Image Loader
 * Automatically adds lazy loading to all images in the app
 * Wrap Layout with this component
 */
import React, { useEffect, useRef } from 'react';
import { enableLazyLoading } from '@/lib/lazyLoadingHelper';

export default function LazyImageLoader({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      enableLazyLoading(containerRef.current);
    }

    // Watch for dynamically added images
    const observer = new MutationObserver(() => {
      if (containerRef.current) {
        enableLazyLoading(containerRef.current);
      }
    });

    observer.observe(containerRef.current, {
      subtree: true,
      childList: true
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}