import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Tag, Store, X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const CATEGORY_LABELS = {
  electronics: 'Electronics',
  tools: 'Tools',
  sports_equipment: 'Sports Equipment',
  books_media: 'Books & Media',
  home_decor: 'Home Decor',
  clothing_accessories: 'Clothing & Accessories',
  collectibles: 'Collectibles',
  handmade_crafts: 'Handmade Crafts',
  vintage_antiques: 'Vintage & Antiques',
  jewelry: 'Jewelry',
  misc: 'Miscellaneous',
  other: 'Other',
};

const SHOP_TYPE_LABELS = {
  farmers_market: "Farmer's Market",
  swap_meet: 'Swap Meet',
  both: 'Both',
};

export default function VendorSearchBar() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [shopType, setShopType] = useState('');
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  const { data: allShops = [] } = useQuery({
    queryKey: ['home-vendor-search'],
    queryFn: () => base44.entities.MarketShop.filter({ is_active: true, status: 'active' }),
    staleTime: 60000,
  });

  const results = allShops.filter(shop => {
    const q = query.toLowerCase();
    const matchesQuery = !q ||
      shop.shop_name?.toLowerCase().includes(q) ||
      shop.description?.toLowerCase().includes(q) ||
      shop.products_summary?.toLowerCase().includes(q);

    const loc = location.toLowerCase();
    const matchesLocation = !loc ||
      shop.city?.toLowerCase().includes(loc) ||
      shop.state?.toLowerCase().includes(loc) ||
      shop.zip?.includes(loc);

    const matchesCategory = !category ||
      (shop.categories || []).includes(category);

    const matchesType = !shopType || shop.shop_type === shopType;

    return matchesQuery && matchesLocation && matchesCategory && matchesType;
  }).slice(0, 6);

  const hasFilters = query || location || category || shopType;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearAll = () => {
    setQuery(''); setLocation(''); setCategory(''); setShopType('');
    setShowResults(false);
  };

  const goToVendor = (shop) => {
    const slug = shop.custom_slug || shop.id;
    window.location.href = `/MarketShopProfile?id=${shop.id}`;
  };

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '860px', margin: '0 auto 16px', position: 'relative' }}>
      {/* Search Box */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Name search */}
          <div style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', borderRadius: '10px', padding: '8px 12px' }}>
           <Search size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
           <input
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="Search vendors..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1f2937', fontSize: '13px', width: '100%', caretColor: '#1f2937'}}
            />
          </div>

          {/* Location */}
          <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', borderRadius: '10px', padding: '8px 12px' }}>
            <MapPin size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              value={location}
              onChange={e => { setLocation(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="City or ZIP..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1f2937', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* Category */}
          <div style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', borderRadius: '10px', padding: '8px 12px' }}>
            <Tag size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setShowResults(true); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: category ? '#1f2937' : '#9ca3af', fontSize: '13px', width: '100%', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#ffffff', color: '#1f2937' }}>Category</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#ffffff', color: '#1f2937' }}>{v}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', borderRadius: '10px', padding: '8px 12px' }}>
            <Store size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <select
              value={shopType}
              onChange={e => { setShopType(e.target.value); setShowResults(true); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: shopType ? '#1f2937' : '#9ca3af', fontSize: '13px', width: '100%', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#ffffff', color: '#1f2937' }}>Market Type</option>
              {Object.entries(SHOP_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#ffffff', color: '#1f2937' }}>{v}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearAll} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && hasFilters && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              No vendors found matching your search
            </div>
          ) : (
            <>
              {results.map(shop => (
                <button
                  key={shop.id}
                  onClick={() => goToVendor(shop)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Store size={16} style={{ color: 'rgba(255,255,255,0.75)' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.shop_name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                      {SHOP_TYPE_LABELS[shop.shop_type]} · {shop.city}, {shop.state}
                    </p>
                  </div>
                  {shop.categories?.slice(0, 2).map(c => (
                    <span key={c} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: '#fed7aa', color: '#92400e', flexShrink: 0, fontWeight: '600' }}>
                      {CATEGORY_LABELS[c] || c}
                    </span>
                  ))}
                  <ChevronRight size={14} style={{ color: '#d1d5db', flexShrink: 0 }} />
                </button>
              ))}
              <button
                onClick={() => { window.location.href = '/MarketDirectory'; }}
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', color: '#ea580c', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'center' }}
              >
                View all vendors in Market Directory →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}