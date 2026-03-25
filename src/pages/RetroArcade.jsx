import React, { useState } from 'react';
import RetroBackground from '@/components/arcade/RetroBackground';
import SnakeGame from '@/components/arcade/SnakeGame';
import ArcadeLeaderboard from '@/components/arcade/ArcadeLeaderboard';
import ScoreSubmitModal from '@/components/arcade/ScoreSubmitModal';
import RetroMusicPlayer from '@/components/arcade/RetroMusicPlayer';

const NEON = {
  pink: '#FF1493',
  cyan: '#00FFFF',
  yellow: '#FFD700',
  green: '#00FF41',
  purple: '#7B2FBE',
  orange: '#FF6600',
};

function NeonText({ children, color = NEON.cyan, size = 16, weight = 900, spacing = 2, style = {} }) {
  return (
    <span style={{
      color, fontWeight: weight, fontSize: size,
      letterSpacing: spacing, textShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
      fontFamily: 'monospace', ...style
    }}>
      {children}
    </span>
  );
}

function CreditTierInfo() {
  const tiers = [
    { score: '500+', credits: 50, label: 'LEGENDARY', color: NEON.yellow },
    { score: '300+', credits: 30, label: 'MASTER', color: NEON.pink },
    { score: '150+', credits: 15, label: 'PRO', color: NEON.cyan },
    { score: '75+',  credits: 7,  label: 'SKILLED', color: NEON.green },
    { score: '25+',  credits: 2,  label: 'ROOKIE', color: NEON.purple },
  ];
  return (
    <div style={{
      border: `2px solid ${NEON.green}`,
      boxShadow: `0 0 15px rgba(0,255,65,0.3)`,
      backgroundColor: 'rgba(0,0,20,0.9)',
      padding: 16
    }}>
      <div style={{ textAlign: 'center', marginBottom: 12, color: NEON.green, fontWeight: 900, letterSpacing: 3, fontSize: 13, textShadow: `0 0 10px ${NEON.green}` }}>
        💎 CREDIT REWARDS
      </div>
      <div className="flex flex-col gap-2">
        {tiers.map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: t.color, fontWeight: 700, fontSize: 11, letterSpacing: 1, textShadow: `0 0 6px ${t.color}`, fontFamily: 'monospace' }}>
              {t.label}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'monospace' }}>{t.score}</span>
            <span style={{ color: NEON.green, fontWeight: 900, fontSize: 13, textShadow: `0 0 6px ${NEON.green}`, fontFamily: 'monospace' }}>
              +{t.credits} cr
            </span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(0,255,65,0.2)', marginTop: 12, paddingTop: 10, color: 'rgba(0,255,255,0.6)', fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>
        Credits apply to SurfCoast platform discounts & perks
      </div>
    </div>
  );
}

export default function RetroArcade() {
  const [pendingScore, setPendingScore] = useState(null);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  const handleGameOver = (score, level) => {
    if (score > 0) {
      setPendingScore({ score, level, game: 'snake' });
    }
  };

  const handleSubmitted = () => {
    setLeaderboardRefresh(k => k + 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0020',
      fontFamily: 'monospace',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <RetroBackground />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '20px 16px 40px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Decorative bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            {['◆', '◀', '▶', '◆'].map((s, i) => (
              <span key={i} style={{ color: NEON.pink, textShadow: `0 0 8px ${NEON.pink}`, fontSize: 14 }}>{s}</span>
            ))}
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 7vw, 56px)', fontWeight: 900, margin: 0,
            background: `linear-gradient(135deg, ${NEON.pink}, ${NEON.cyan}, ${NEON.yellow})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            letterSpacing: 6,
            fontFamily: 'monospace'
          }}>
            RETRO ARCADE
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ height: 1, width: 60, backgroundColor: NEON.pink, boxShadow: `0 0 6px ${NEON.pink}` }} />
            <NeonText color={NEON.cyan} size={12} spacing={4}>SURFCOAST MARKETPLACE</NeonText>
            <span style={{ height: 1, width: 60, backgroundColor: NEON.pink, boxShadow: `0 0 6px ${NEON.pink}` }} />
          </div>
          <p style={{ color: 'rgba(0,255,255,0.6)', fontSize: 12, marginTop: 8, letterSpacing: 2 }}>
            PLAY • COMPETE • EARN CREDITS
          </p>
        </div>

        {/* Main layout */}
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">

            {/* Left panel */}
            <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
              <RetroMusicPlayer />
              <CreditTierInfo />
            </div>

            {/* Center — Game */}
            <div className="flex-shrink-0 flex flex-col items-center">
              {/* Game selector label */}
              <div style={{
                marginBottom: 12, padding: '6px 20px',
                border: `1px solid ${NEON.cyan}`,
                boxShadow: `0 0 10px rgba(0,255,255,0.2)`,
                backgroundColor: 'rgba(0,255,255,0.05)'
              }}>
                <NeonText color={NEON.cyan} size={13} spacing={4}>🕹️ NEON SNAKE</NeonText>
              </div>
              <SnakeGame onGameOver={handleGameOver} />
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
              <ArcadeLeaderboard game="snake" refreshKey={leaderboardRefresh} />

              {/* How to play */}
              <div style={{
                border: `2px solid ${NEON.orange}`,
                boxShadow: `0 0 12px rgba(255,102,0,0.3)`,
                backgroundColor: 'rgba(0,0,20,0.9)',
                padding: 14
              }}>
                <div style={{ color: NEON.orange, fontWeight: 900, letterSpacing: 3, fontSize: 12, marginBottom: 10, textShadow: `0 0 8px ${NEON.orange}` }}>
                  ❓ HOW TO PLAY
                </div>
                {[
                  ['🎮', 'Arrow keys / WASD to move'],
                  ['🍎', 'Eat yellow dots to grow'],
                  ['📈', 'Higher score = more credits'],
                  ['🏆', 'Submit score to leaderboard'],
                  ['💳', 'Add email to claim credits'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12 }}>{icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 1.4 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['▓', '░', '▒', '█', '▓', '░', '▒', '█', '▓', '░', '▒', '█'].map((c, i) => (
              <span key={i} style={{
                color: [NEON.pink, NEON.cyan, NEON.yellow, NEON.green, NEON.purple, NEON.orange][i % 6],
                opacity: 0.4, fontSize: 12
              }}>{c}</span>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 3, marginTop: 8 }}>
            © SURFCOAST ARCADE — INSERT COIN TO CONTINUE
          </p>
        </div>
      </div>

      {/* Score submit modal */}
      {pendingScore && (
        <ScoreSubmitModal
          score={pendingScore.score}
          level={pendingScore.level}
          game={pendingScore.game}
          onClose={() => setPendingScore(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}