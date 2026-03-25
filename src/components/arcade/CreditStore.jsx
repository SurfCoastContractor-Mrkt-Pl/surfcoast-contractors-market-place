import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const NEON = {
  pink: '#FF1493', cyan: '#00FFFF', yellow: '#FFD700',
  green: '#00FF41', purple: '#7B2FBE', orange: '#FF6600',
};

export const PERKS = [
  {
    id: 'neon_speed_mode',
    name: 'NEON SPEED MODE',
    description: 'Snake moves 50% faster — higher risk, higher score multiplier',
    cost: 10,
    icon: '⚡',
    color: NEON.yellow,
    type: 'game_mode',
  },
  {
    id: 'ghost_mode',
    name: 'GHOST MODE',
    description: 'Pass through walls — the snake wraps around edges instead of dying',
    cost: 15,
    icon: '👻',
    color: NEON.cyan,
    type: 'game_mode',
  },
  {
    id: 'double_credits',
    name: 'DOUBLE CREDITS',
    description: '2x credit rewards on your next submitted score',
    cost: 20,
    icon: '💰',
    color: NEON.green,
    type: 'boost',
  },
  {
    id: 'neon_trail',
    name: 'NEON TRAIL SKIN',
    description: 'Rainbow neon glowing snake skin — pure cosmetic flex',
    cost: 8,
    icon: '🌈',
    color: NEON.pink,
    type: 'cosmetic',
  },
  {
    id: 'platform_discount_5',
    name: '5% PLATFORM DISCOUNT',
    description: 'Redeem for 5% off your next SurfCoast service booking',
    cost: 50,
    icon: '🏷️',
    color: NEON.orange,
    type: 'platform',
  },
  {
    id: 'platform_discount_10',
    name: '10% PLATFORM DISCOUNT',
    description: 'Redeem for 10% off your next SurfCoast service booking',
    cost: 100,
    icon: '🎁',
    color: NEON.purple,
    type: 'platform',
  },
];

const TYPE_LABELS = {
  game_mode: { label: 'GAME MODE', color: NEON.cyan },
  boost: { label: 'BOOST', color: NEON.green },
  cosmetic: { label: 'COSMETIC', color: NEON.pink },
  platform: { label: 'PLATFORM PERK', color: NEON.orange },
};

export default function CreditStore({ wallet, onPurchase }) {
  const [unlocked, setUnlocked] = useState([]);
  const [purchasing, setPurchasing] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (wallet?.player_email) {
      loadUnlocks();
    }
  }, [wallet]);

  const loadUnlocks = async () => {
    const results = await base44.entities.ArcadeUnlock.filter({ player_email: wallet.player_email });
    setUnlocked(results.map(r => r.perk_id));
  };

  const buy = async (perk) => {
    if (!wallet) {
      setMessage({ text: 'Look up your wallet first to buy perks!', color: NEON.orange });
      return;
    }
    if ((wallet.total_credits ?? 0) < perk.cost) {
      setMessage({ text: `Not enough credits! You need ${perk.cost} but have ${wallet.total_credits ?? 0}.`, color: NEON.pink });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (unlocked.includes(perk.id) && perk.type !== 'boost') {
      setMessage({ text: 'Already unlocked!', color: NEON.yellow });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setPurchasing(perk.id);
    try {
      // Deduct credits
      const creditRecords = await base44.entities.ArcadeCredit.filter({ player_email: wallet.player_email });
      if (creditRecords.length > 0) {
        const rec = creditRecords[0];
        const newTotal = (rec.total_credits ?? 0) - perk.cost;
        await base44.entities.ArcadeCredit.update(rec.id, { total_credits: newTotal });

        // Record the unlock
        await base44.entities.ArcadeUnlock.create({
          player_email: wallet.player_email,
          perk_id: perk.id,
          perk_name: perk.name,
          credits_spent: perk.cost,
          unlocked_at: new Date().toISOString(),
        });

        setUnlocked(prev => [...prev, perk.id]);
        setMessage({ text: `✅ ${perk.name} UNLOCKED! (${newTotal} credits remaining)`, color: NEON.green });
        onPurchase && onPurchase({ perk, newBalance: newTotal });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch {
      setMessage({ text: 'Purchase failed. Try again.', color: NEON.pink });
      setTimeout(() => setMessage(null), 3000);
    }
    setPurchasing(null);
  };

  return (
    <div style={{
      border: `2px solid ${NEON.purple}`,
      boxShadow: `0 0 20px rgba(123,47,190,0.4)`,
      backgroundColor: 'rgba(0,0,20,0.95)',
      padding: 20, marginTop: 24
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ color: NEON.purple, fontWeight: 900, letterSpacing: 4, fontSize: 16, textShadow: `0 0 14px ${NEON.purple}` }}>
          🏪 CREDIT STORE
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
          SPEND YOUR EARNED CREDITS
        </div>
      </div>

      {/* Balance bar */}
      {wallet && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          backgroundColor: 'rgba(255,215,0,0.08)', border: `1px solid rgba(255,215,0,0.3)`,
          padding: '6px 16px', marginBottom: 16, marginTop: 12
        }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>YOUR BALANCE:</span>
          <span style={{ color: NEON.yellow, fontWeight: 900, fontSize: 18, textShadow: `0 0 8px ${NEON.yellow}` }}>
            {wallet.total_credits ?? 0}
          </span>
          <span style={{ color: 'rgba(255,215,0,0.5)', fontSize: 11 }}>CREDITS</span>
        </div>
      )}

      {!wallet && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', margin: '12px 0 16px', lineHeight: 1.5 }}>
          Look up your wallet above to purchase perks
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{
          color: message.color, fontSize: 12, textAlign: 'center', marginBottom: 12,
          padding: '6px', border: `1px solid ${message.color}40`,
          textShadow: `0 0 8px ${message.color}`, fontWeight: 700
        }}>
          {message.text}
        </div>
      )}

      {/* Perk grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {PERKS.map(perk => {
          const isUnlocked = unlocked.includes(perk.id) && perk.type !== 'boost';
          const canAfford = (wallet?.total_credits ?? 0) >= perk.cost;
          const typeInfo = TYPE_LABELS[perk.type];

          return (
            <div key={perk.id} style={{
              border: `1px solid ${isUnlocked ? NEON.green : perk.color}40`,
              backgroundColor: isUnlocked ? 'rgba(0,255,65,0.05)' : 'rgba(255,255,255,0.03)',
              padding: 14, display: 'flex', flexDirection: 'column', gap: 6,
              transition: 'border-color 200ms',
            }}>
              {/* Type badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: typeInfo.color, letterSpacing: 1, fontWeight: 700, border: `1px solid ${typeInfo.color}50`, padding: '1px 5px' }}>
                  {typeInfo.label}
                </span>
                <span style={{ fontSize: 18 }}>{perk.icon}</span>
              </div>

              {/* Name */}
              <div style={{ color: isUnlocked ? NEON.green : perk.color, fontWeight: 900, fontSize: 12, letterSpacing: 1, textShadow: isUnlocked ? `0 0 6px ${NEON.green}` : `0 0 6px ${perk.color}` }}>
                {perk.name}
              </div>

              {/* Description */}
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.5, flex: 1 }}>
                {perk.description}
              </div>

              {/* Cost + Buy */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: NEON.yellow, fontWeight: 900, fontSize: 14, textShadow: `0 0 6px ${NEON.yellow}` }}>
                  {perk.cost} CR
                </span>
                {isUnlocked ? (
                  <span style={{ color: NEON.green, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>✓ OWNED</span>
                ) : (
                  <button
                    onClick={() => buy(perk)}
                    disabled={!!purchasing || !canAfford}
                    style={{
                      padding: '4px 12px', backgroundColor: 'transparent',
                      border: `1px solid ${canAfford ? perk.color : 'rgba(255,255,255,0.2)'}`,
                      color: canAfford ? perk.color : 'rgba(255,255,255,0.3)',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontWeight: 900, fontSize: 10, letterSpacing: 1,
                      boxShadow: canAfford && !purchasing ? `0 0 6px ${perk.color}40` : 'none',
                      transition: 'all 150ms'
                    }}
                  >
                    {purchasing === perk.id ? '...' : 'BUY'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
        Platform perks are redeemable at checkout on SurfCoast services. Game modes activate on your next play session.
      </p>
    </div>
  );
}