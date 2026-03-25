import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function ArcadeLeaderboard({ game = 'snake', refreshKey }) {
  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['arcade-leaderboard', game, refreshKey],
    queryFn: () => base44.entities.ArcadeScore.filter({ game }, '-score', 10),
  });

  return (
    <div style={{
      border: '2px solid #FFD700',
      boxShadow: '0 0 15px rgba(255,215,0,0.3)',
      backgroundColor: 'rgba(0,0,20,0.9)',
      padding: 16,
      minWidth: 240
    }}>
      <div style={{
        textAlign: 'center', marginBottom: 12,
        color: '#FFD700', fontWeight: 900, letterSpacing: 3, fontSize: 13,
        textShadow: '0 0 10px #FFD700'
      }}>
        ⚡ HIGH SCORES ⚡
      </div>

      {isLoading ? (
        <div style={{ color: '#00FFFF', textAlign: 'center', fontSize: 12 }}>LOADING...</div>
      ) : scores.length === 0 ? (
        <div style={{ color: 'rgba(0,255,255,0.5)', textAlign: 'center', fontSize: 12, padding: '12px 0' }}>
          No scores yet — be the first!
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {scores.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 8px',
              backgroundColor: i === 0 ? 'rgba(255,215,0,0.1)' : 'transparent',
              borderLeft: i === 0 ? '3px solid #FFD700' : '3px solid transparent'
            }}>
              <span style={{ fontSize: 14, width: 22 }}>{i < 3 ? MEDAL[i] : `${i + 1}.`}</span>
              <span style={{
                flex: 1, color: i === 0 ? '#FFD700' : '#00FFFF',
                fontWeight: i === 0 ? 900 : 600, fontSize: 12,
                textShadow: i === 0 ? '0 0 8px #FFD700' : '0 0 4px #00FFFF',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {s.player_name}
              </span>
              <span style={{ color: '#FF1493', fontWeight: 900, fontSize: 13, textShadow: '0 0 6px #FF1493' }}>
                {s.score.toLocaleString()}
              </span>
              {s.credits_awarded > 0 && (
                <span style={{ color: '#00FF41', fontSize: 10, fontWeight: 700 }}>+{s.credits_awarded}cr</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}