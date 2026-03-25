import React, { useState } from 'react';

// Curated 80s music via YouTube embeds (audio only iframes)
const TRACKS = [
  { title: "Everybody Have Fun Tonight", artist: "Wang Chung", yt: "AbrUmHOQkS4" },
  { title: "Good Enough", artist: "Cyndi Lauper", yt: "rMuAGN5DPBM" },
  { title: "Take On Me", artist: "a-ha", yt: "djV11Xbc914" },
  { title: "Don't You (Forget About Me)", artist: "Simple Minds", yt: "CdqoNKCCt7A" },
  { title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper", yt: "PIb6AZdTr-A" },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses", yt: "1w7OgIMMRc4" },
  { title: "Jump", artist: "Van Halen", yt: "SwYN7mTi6HM" },
  { title: "Livin' on a Prayer", artist: "Bon Jovi", yt: "lDK9QqIzhwk" },
];

export default function RetroMusicPlayer() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [key, setKey] = useState(0);

  const play = (idx) => {
    setCurrent(idx);
    setPlaying(true);
    setKey(k => k + 1);
  };

  const toggle = () => {
    if (!playing) play(current);
    else setPlaying(false);
  };

  return (
    <div style={{
      border: '2px solid #7B2FBE',
      boxShadow: '0 0 15px rgba(123,47,190,0.4)',
      backgroundColor: 'rgba(0,0,20,0.9)',
      padding: 16
    }}>
      <div style={{
        textAlign: 'center', marginBottom: 12,
        color: '#FF69B4', fontWeight: 900, letterSpacing: 3, fontSize: 13,
        textShadow: '0 0 10px #FF69B4'
      }}>
        📻 80s RADIO
      </div>

      {/* Now playing */}
      <div style={{
        backgroundColor: 'rgba(123,47,190,0.15)',
        border: '1px solid rgba(123,47,190,0.4)',
        padding: '8px 12px', marginBottom: 12, textAlign: 'center'
      }}>
        <div style={{ color: '#00FFFF', fontSize: 11, letterSpacing: 2, marginBottom: 2 }}>NOW PLAYING</div>
        <div style={{ color: '#FFD700', fontWeight: 900, fontSize: 13, textShadow: '0 0 8px #FFD700' }}>
          {TRACKS[current].title}
        </div>
        <div style={{ color: '#FF69B4', fontSize: 11 }}>{TRACKS[current].artist}</div>
      </div>

      {/* Hidden iframe player */}
      {playing && (
        <iframe
          key={key}
          style={{ display: 'none' }}
          src={`https://www.youtube.com/embed/${TRACKS[current].yt}?autoplay=1&controls=0`}
          allow="autoplay"
          title="music"
        />
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-3">
        <button onClick={() => play((current - 1 + TRACKS.length) % TRACKS.length)}
          style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #7B2FBE', color: '#7B2FBE', cursor: 'pointer', fontSize: 14 }}>⏮</button>
        <button onClick={toggle}
          style={{ padding: '6px 16px', backgroundColor: playing ? 'rgba(255,20,147,0.2)' : 'transparent', border: '2px solid #FF1493', color: '#FF1493', cursor: 'pointer', fontWeight: 900, fontSize: 14, boxShadow: playing ? '0 0 10px #FF1493' : 'none' }}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => play((current + 1) % TRACKS.length)}
          style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #7B2FBE', color: '#7B2FBE', cursor: 'pointer', fontSize: 14 }}>⏭</button>
      </div>

      {/* Track list */}
      <div className="flex flex-col gap-1">
        {TRACKS.map((t, i) => (
          <button key={i} onClick={() => play(i)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 8px', backgroundColor: current === i ? 'rgba(255,20,147,0.1)' : 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            borderLeft: current === i ? '2px solid #FF1493' : '2px solid transparent'
          }}>
            <span style={{ color: current === i ? '#FF1493' : 'rgba(255,255,255,0.3)', fontSize: 10 }}>
              {current === i && playing ? '♪' : `${i + 1}.`}
            </span>
            <span style={{ color: current === i ? '#FFD700' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: current === i ? 700 : 400 }}>
              {t.title}
            </span>
          </button>
        ))}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginTop: 8 }}>
        * Music requires browser autoplay permission
      </p>
    </div>
  );
}