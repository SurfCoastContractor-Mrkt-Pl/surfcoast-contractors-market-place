import { useEffect, useRef } from 'react';

/**
 * useSwipeNav — attach horizontal swipe gestures to an element ref.
 * @param {boolean} enabled  - whether swipe is active
 * @param {string[]} tabs    - ordered list of tab IDs
 * @param {string} activeTab - current active tab ID
 * @param {function} onTabChange - callback(newTabId)
 * @param {number} threshold - minimum px distance to register a swipe (default 60)
 */
export default function useSwipeNav(enabled, tabs, activeTab, onTabChange, threshold = 60) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      // Ignore mostly-vertical swipes (scrolling)
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < threshold) return;

      const currentIdx = tabs.indexOf(activeTab);
      if (dx < 0 && currentIdx < tabs.length - 1) {
        // Swipe left → next tab
        onTabChange(tabs[currentIdx + 1]);
      } else if (dx > 0 && currentIdx > 0) {
        // Swipe right → previous tab
        onTabChange(tabs[currentIdx - 1]);
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, tabs, activeTab, onTabChange, threshold]);
}