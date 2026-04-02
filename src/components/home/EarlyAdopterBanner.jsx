import React, { useState, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EarlyAdopterBanner() {
  const [waiverCount, setWaiverCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await base44.functions.invoke('getEarlyAdopterCount', {});
        setWaiverCount(result?.data?.count ?? 0);
      } catch {
        // Silently fail — banner just won't show spot count
        setWaiverCount(0);
      }
    };
    fetchCount();
  }, []);

  if (dismissed || waiverCount >= 100) return null;

  const spotsLeft = 100 - waiverCount;
  const percentFilled = (waiverCount / 100) * 100;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #dbeafe',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss founding member banner"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        <X size={18} aria-hidden="true" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <Zap size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            🎉 Founding Member Spots Available
          </h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0', fontWeight: 500 }}>
            Be part of our founding community and get 1 year free
          </p>
        </div>
      </div>

      <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '8px', marginBottom: '10px' }}>
        <div style={{ background: '#3b82f6', height: '4px', borderRadius: '4px', width: `${percentFilled}%`, transition: 'width 0.3s ease' }} />
      </div>

      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
        <strong style={{ color: '#1f2937' }}>{spotsLeft}</strong> spots left • First 100 members get 1 year free
      </p>
    </div>
  );
}