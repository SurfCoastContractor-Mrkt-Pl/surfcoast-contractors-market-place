/**
 * Responsive Job Tabs
 * Horizontal scroll on mobile, normal flex layout on desktop
 */
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ResponsiveJobTabs({ tabs, activeTab, onTabChange }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    scrollContainerRef.current?.addEventListener('scroll', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      scrollContainerRef.current?.removeEventListener('scroll', checkScroll);
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative w-full">
      {/* Left scroll button (mobile only) */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 z-10 bg-gradient-to-r from-white to-transparent p-2 lg:hidden"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide lg:overflow-visible flex gap-2 px-12 lg:px-0"
        data-test="tabs-list"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            className="whitespace-nowrap"
            data-test="filter-btn"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Right scroll button (mobile only) */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 z-10 bg-gradient-to-l from-white to-transparent p-2 lg:hidden"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}