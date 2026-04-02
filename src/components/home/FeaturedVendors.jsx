import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, Star, Store } from 'lucide-react';

const SHOP_TYPE_LABELS = {
  farmers_market: "Farmer's Market",
  swap_meet: 'Swap Meet',
  both: 'Both',
};

export default function FeaturedVendors() {
  const scrollPositionRef = useRef(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollContainerRef = useRef(null);

  // Fetch featured active shops
  const { data: featuredShops = [], isLoading } = useQuery({
    queryKey: ['featured-vendors'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true, status: 'active', is_featured: true }),
    staleTime: 60000,
  });

  // Auto-scroll carousel — uses ref so interval is only created once per isAutoScroll/data change
  useEffect(() => {
    if (!isAutoScroll || !scrollContainerRef.current || featuredShops.length === 0) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      if (scrollPositionRef.current >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        scrollPositionRef.current = 0;
      } else {
        const newPosition = scrollPositionRef.current + 320;
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
        scrollPositionRef.current = newPosition;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoScroll, featuredShops.length]);

  const handleScroll = (direction) => {
    setIsAutoScroll(false);
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 320;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      scrollPositionRef.current = Math.max(0, scrollPositionRef.current - scrollAmount);
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      scrollPositionRef.current += scrollAmount;
    }

    setTimeout(() => setIsAutoScroll(true), 3000);
  };

  if (isLoading || featuredShops.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto 28px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{
          fontSize: 'clamp(18px, 4vw, 24px)',
          fontWeight: '700',
          color: '#ffffff',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Star size={20} style={{ color: '#f97316' }} />
          Featured Partners
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>
          Premium vendors and markets we recommend
        </p>
      </div>

      {/* Carousel Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll('left')}
          aria-label="Scroll vendors left"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            paddingLeft: '36px',
            paddingRight: '36px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {featuredShops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => window.location.href = `/MarketShopProfile?id=${shop.id}`}
              style={{
                flex: '0 0 320px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                scrollSnapAlign: 'start',
                textAlign: 'left',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Featured Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(249,115,22,0.15)',
                color: '#f97316',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                <Star size={12} />
                Featured
              </div>

              {/* Shop Info */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px',
              }}>
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.shop_name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Store size={20} style={{ color: 'rgba(255,255,255,0.75)' }} />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {shop.shop_name}
                  </p>
                  <p style={{
                    margin: '2px 0 0',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.75)',
                  }}>
                    {shop.city}, {shop.state}
                  </p>
                </div>
              </div>

              {/* Type Badge */}
              <div style={{
                display: 'inline-block',
                padding: '3px 8px',
                background: 'rgba(59,130,246,0.15)',
                color: '#3b82f6',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                marginBottom: '8px',
              }}>
                {SHOP_TYPE_LABELS[shop.shop_type] || shop.shop_type}
              </div>

              {/* Description */}
              {shop.products_summary && (
                <p style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.75)',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.4',
                }}>
                  {shop.products_summary}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Scroll vendors right"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
        >
          <ChevronRight size={18} />
        </button>
      </div>


    </div>
  );
}