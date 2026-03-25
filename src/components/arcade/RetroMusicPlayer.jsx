import React, { useState, useRef, useEffect } from 'react';

// 80s music tracks with direct audio URLs (royalty-free sources)
const TRACKS = [
  { title: "Synth Wave 1", artist: "Retro Arcade", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Digital Dreams", artist: "Neon Vibes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Pixel Paradise", artist: "8-Bit Echo", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Arcade Nights", artist: "Synth Master", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "Retro Circuit", artist: "Crystal Keys", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "Electric Horizon", artist: "Neon Pulse", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { title: "Cyberpunk Vibes", artist: "Synth Wave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { title: "Laser Grid", artist: "Pixel Sound", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { title: "Neon Nights", artist: "Arcade Master", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
];

export default function RetroMusicPlayer() {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.src = TRACKS[current].url;
      audio.play().catch(() => {
        // Autoplay blocked - user must click play button
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing, current]);

  // Auto-advance to next track when current finishes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrent(i => (i + 1) % TRACKS.length);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const play = (idx) => {
    setCurrent(idx);
    setPlaying(true);
  };

  const toggle = () => {
    setPlaying(!playing);
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

      {/* Hidden audio element */}
      <audio ref={audioRef} crossOrigin="anonymous" />

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