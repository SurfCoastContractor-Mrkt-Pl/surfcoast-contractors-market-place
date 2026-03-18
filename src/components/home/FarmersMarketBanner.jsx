import React from 'react';
import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FarmersMarketBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(168, 85, 247, 0.7) 100%)',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      maxWidth: '900px',
      width: '100%',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <Store size={24} style={{ color: '#fff', flexShrink: 0 }} />
        <div>
          <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            Farmers Markets & Swap Meets
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
            Browse local vendors or create your own MarketShop
          </p>
        </div>
      </div>
      <Link to="/MarketDirectory" style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <button style={{
          background: '#8b5cf6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background 0.2s',
          whiteSpace: 'nowrap',
          minHeight: '36px',
          display: 'flex',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
        onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
        >
          Browse Vendors →
        </button>
      </Link>
    </div>
  );
}