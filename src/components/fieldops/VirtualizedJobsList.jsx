import React, { useState, useRef, useEffect } from 'react';

const ITEM_HEIGHT = 120;
const BUFFER_SIZE = 5;

export default function VirtualizedJobsList({ items, renderItem, onScroll }) {
  const [visibleStart, setVisibleStart] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const newStart = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    setVisibleStart(newStart);
    onScroll?.();
  };

  const visibleEnd = Math.min(
    items.length,
    visibleStart + Math.ceil(window.innerHeight / ITEM_HEIGHT) + BUFFER_SIZE * 2
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * ITEM_HEIGHT;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100vh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <div style={{ height: visibleStart * ITEM_HEIGHT }} />
      
      {visibleItems.map((item, idx) => (
        <div
          key={visibleStart + idx}
          style={{ minHeight: ITEM_HEIGHT }}
        >
          {renderItem(item, visibleStart + idx)}
        </div>
      ))}
      
      <div style={{ height: (items.length - visibleEnd) * ITEM_HEIGHT }} />
    </div>
  );
}