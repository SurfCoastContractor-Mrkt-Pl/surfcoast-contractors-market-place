import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const NEON = {
  pink: '#FF1493', cyan: '#00FFFF', yellow: '#FFD700',
  green: '#00FF41', purple: '#7B2FBE', orange: '#FF6600',
};

export default function CreditWallet({ onWalletLoaded }) {
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const results = await base44.entities.ArcadeCredit.filter({ player_email: email.trim().toLowerCase() });
      if (results && results.length > 0) {
        setWallet(results[0]);
        onWalletLoaded && onWalletLoaded(results[0]);
      } else {
        setError('No wallet found. Play a game and submit your score with this email to create one!');
        setWallet(null);
        onWalletLoaded && onWalletLoaded(null);
      }
    } catch {
      setError('Could not look up wallet. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: `2px solid ${NEON.yellow}`,
      boxShadow: `0 0 15px rgba(255,215,0,0.3)`,
      backgroundColor: 'rgba(0,0,20,0.9)',
      padding: 16
    }}>
      <div style={{ textAlign: 'center', marginBottom: 12, color: NEON.yellow, fontWeight: 900, letterSpacing: 3, fontSize: 13, textShadow: `0 0 10px ${NEON.yellow}` }}>
        💳 CREDIT WALLET
      </div>

      {!wallet ? (
        <form onSubmit={lookup}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
            style={{
              width: '100%', padding: '7px 10px', marginBottom: 8, boxSizing: 'border-box',
              backgroundColor: 'rgba(255,215,0,0.06)', border: `1px solid ${NEON.yellow}`,
              color: NEON.yellow, fontSize: 11, outline: 'none', fontFamily: 'monospace'
            }}
          />
          <button type="submit" disabled={loading || !email.trim()} style={{
            width: '100%', padding: '7px', backgroundColor: 'transparent',
            border: `2px solid ${NEON.yellow}`, color: NEON.yellow,
            fontWeight: 900, letterSpacing: 2, cursor: 'pointer', fontSize: 11,
            boxShadow: `0 0 8px ${NEON.yellow}40`, opacity: loading ? 0.6 : 1
          }}>
            {loading ? 'LOOKING UP...' : 'CHECK BALANCE'}
          </button>
          {error && (
            <p style={{ color: NEON.orange, fontSize: 10, marginTop: 8, lineHeight: 1.4, textAlign: 'center' }}>{error}</p>
          )}
        </form>
      ) : (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 1 }}>PLAYER</div>
            <div style={{ color: NEON.cyan, fontWeight: 700, fontSize: 12 }}>{wallet.player_name}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: NEON.yellow, fontWeight: 900, fontSize: 22, textShadow: `0 0 10px ${NEON.yellow}` }}>
                {wallet.total_credits ?? 0}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1 }}>CREDITS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: NEON.green, fontWeight: 700, fontSize: 16, textShadow: `0 0 8px ${NEON.green}` }}>
                {wallet.lifetime_high_score ?? 0}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1 }}>HIGH SCORE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: NEON.pink, fontWeight: 700, fontSize: 16 }}>
                {wallet.games_played ?? 0}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1 }}>PLAYED</div>
            </div>
          </div>
          <button onClick={() => { setWallet(null); onWalletLoaded && onWalletLoaded(null); }} style={{
            width: '100%', padding: '5px', backgroundColor: 'transparent',
            border: `1px solid rgba(255,255,255,0.2)`, color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 10, letterSpacing: 1
          }}>
            SWITCH ACCOUNT
          </button>
        </div>
      )}
    </div>
  );
}