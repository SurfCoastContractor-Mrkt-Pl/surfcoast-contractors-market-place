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
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '8px 16px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Name search */}
          <div style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '6px 12px' }}>
            <Search size={14} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="Search vendors..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* Location */}
          <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '6px 12px' }}>
            <MapPin size={14} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
            <input
              value={location}
              onChange={e => { setLocation(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="City, State, ZIP..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* Category */}
          <div style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '6px 12px' }}>
            <Tag size={14} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setShowResults(true); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: category ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: '13px', width: '100%', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#1a2a3a' }}>Category</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#1a2a3a' }}>{v}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '6px 12px' }}>
            <Store size={14} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
            <select
              value={shopType}
              onChange={e => { setShopType(e.target.value); setShowResults(true); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: shopType ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: '13px', width: '100%', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#1a2a3a' }}>Market Type</option>
              {Object.entries(SHOP_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#1a2a3a' }}>{v}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearAll} style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
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
          background: 'rgba(13,27,42,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          zIndex: 100,
          overflow: 'hidden',
          backdropFilter: 'blur(16px)',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              No vendors found matching your search
            </div>
          ) : (
            <>
              {results.map(shop => (
                <button
                  key={shop.id}
                  onClick={() => goToVendor(shop)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Store size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.shop_name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                      {SHOP_TYPE_LABELS[shop.shop_type]} · {shop.city}, {shop.state}
                    </p>
                  </div>
                  {shop.categories?.slice(0, 2).map(c => (
                    <span key={c} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(249,115,22,0.15)', color: '#F97316', flexShrink: 0 }}>
                      {CATEGORY_LABELS[c] || c}
                    </span>
                  ))}
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </button>
              ))}
              <button
                onClick={() => { window.location.href = '/MarketDirectory'; }}
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', color: '#F97316', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'center' }}
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