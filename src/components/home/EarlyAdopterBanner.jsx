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
      background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
      border: '1px solid rgba(59,130,246,0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        <X size={18} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <Zap size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
            🎉 Founding Member Spots Available
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontWeight: 500 }}>
            Be part of our founding community and get 1 year free
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px', marginBottom: '10px' }}>
        <div style={{ background: '#3b82f6', height: '4px', borderRadius: '4px', width: `${percentFilled}%`, transition: 'width 0.3s ease' }} />
      </div>

      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
        <strong style={{ color: '#fff' }}>{spotsLeft}</strong> spots left • First 100 members get 1 year free
      </p>
    </div>
  );
}