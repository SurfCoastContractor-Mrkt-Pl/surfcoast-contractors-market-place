import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const CREDIT_TIERS = [
  { minScore: 500, credits: 50, label: 'LEGENDARY' },
  { minScore: 300, credits: 30, label: 'MASTER' },
  { minScore: 150, credits: 15, label: 'PRO' },
  { minScore: 75,  credits: 7,  label: 'SKILLED' },
  { minScore: 25,  credits: 2,  label: 'ROOKIE' },
];

function getCredits(score) {
  for (const t of CREDIT_TIERS) {
    if (score >= t.minScore) return t;
  }
  return { credits: 0, label: 'KEEP TRYING' };
}

export default function ScoreSubmitModal({ score, level, game, onClose, onSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const tier = getCredits(score);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const credits = tier.credits;

    // Save score
    await base44.entities.ArcadeScore.create({
      player_name: name.trim(),
      player_email: email.trim() || null,
      game,
      score,
      level,
      credits_awarded: credits,
      credits_claimed: false
    });

    // Update or create arcade credit record
    if (email.trim()) {
      const existing = await base44.entities.ArcadeCredit.filter({ player_email: email.trim() });
      if (existing && existing.length > 0) {
        const rec = existing[0];
        await base44.entities.ArcadeCredit.update(rec.id, {
          total_credits: (rec.total_credits || 0) + credits,
          lifetime_high_score: Math.max(rec.lifetime_high_score || 0, score),
          games_played: (rec.games_played || 0) + 1,
          player_name: name.trim()
        });
      } else {
        await base44.entities.ArcadeCredit.create({
          player_email: email.trim(),
          player_name: name.trim(),
          total_credits: credits,
          lifetime_high_score: score,
          games_played: 1
        });
      }
    }

    setDone(true);
    setSubmitting(false);
    onSubmitted && onSubmitted();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,10,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#050015',
        border: '3px solid #FF1493',
        boxShadow: '0 0 40px #FF1493',
        padding: 32, maxWidth: 360, width: '90%',
        textAlign: 'center'
      }}>
        {done ? (
          <div>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🕹️</div>
            <div style={{ color: '#FFD700', fontWeight: 900, fontSize: 20, letterSpacing: 3, textShadow: '0 0 15px #FFD700' }}>
              SCORE SAVED!
            </div>
            {tier.credits > 0 && (
              <div style={{ color: '#00FF41', fontWeight: 700, fontSize: 15, marginTop: 8, textShadow: '0 0 8px #00FF41' }}>
                +{tier.credits} PLATFORM CREDITS EARNED!
              </div>
            )}
            <div style={{ color: '#00FFFF', fontSize: 13, marginTop: 8 }}>{tier.label} RANK</div>
            <button onClick={onClose} style={{
              marginTop: 20, padding: '8px 28px',
              backgroundColor: 'transparent', border: '2px solid #FFD700',
              color: '#FFD700', fontWeight: 900, letterSpacing: 2,
              cursor: 'pointer', boxShadow: '0 0 10px #FFD700', fontSize: 13
            }}>PLAY AGAIN</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ color: '#FF1493', fontWeight: 900, fontSize: 18, letterSpacing: 3, textShadow: '0 0 12px #FF1493', marginBottom: 4 }}>
              GAME OVER
            </div>
            <div style={{ color: '#FFD700', fontWeight: 900, fontSize: 28, textShadow: '0 0 15px #FFD700', marginBottom: 4 }}>
              {score.toLocaleString()}
            </div>
            {tier.credits > 0 && (
              <div style={{ color: '#00FF41', fontSize: 13, fontWeight: 700, marginBottom: 16, textShadow: '0 0 8px #00FF41' }}>
                🏆 {tier.label} — You earn {tier.credits} credits!
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="ENTER YOUR NAME"
                required maxLength={20}
                style={{
                  width: '100%', padding: '8px 12px',
                  backgroundColor: 'rgba(0,255,255,0.08)',
                  border: '1px solid #00FFFF', color: '#00FFFF',
                  fontWeight: 700, letterSpacing: 1, outline: 'none',
                  fontSize: 13
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="EMAIL (optional — to claim credits)"
                type="email"
                style={{
                  width: '100%', padding: '8px 12px',
                  backgroundColor: 'rgba(255,20,147,0.05)',
                  border: '1px solid rgba(255,20,147,0.5)', color: '#FF69B4',
                  fontWeight: 600, letterSpacing: 1, outline: 'none',
                  fontSize: 12
                }}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '8px', backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 12
              }}>SKIP</button>
              <button type="submit" disabled={submitting || !name.trim()} style={{
                flex: 2, padding: '8px',
                backgroundColor: 'transparent',
                border: '2px solid #FF1493', color: '#FF1493',
                fontWeight: 900, letterSpacing: 2, cursor: 'pointer',
                boxShadow: '0 0 10px #FF1493', fontSize: 13,
                opacity: (!name.trim() || submitting) ? 0.5 : 1
              }}>
                {submitting ? 'SAVING...' : 'SUBMIT SCORE'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}