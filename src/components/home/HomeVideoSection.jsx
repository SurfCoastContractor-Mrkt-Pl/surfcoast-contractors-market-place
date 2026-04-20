import { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PLAYLIST = [
  { id: 'I-kuZgh5lMQ', title: 'SurfCoast Overview' },
  { id: '9bZkp7q19f0', title: 'Platform Features' },
  { id: 'jNQXAC9IVRw', title: 'Getting Started' },
];

export default function HomeVideoSection() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);

  const goTo = (index) => {
    setPlaying(false);
    setTimeout(() => setCurrent(index), 100);
  };

  const prev = () => goTo((current - 1 + PLAYLIST.length) % PLAYLIST.length);
  const next = () => goTo((current + 1) % PLAYLIST.length);

  const video = PLAYLIST[current];

  return (
    <div style={{ background: '#111112', padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#aaa', fontStyle: 'italic', marginBottom: 16 }}>
        For your entertainment
      </p>

      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a2b', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {!playing ? (
          <div
            onClick={() => setPlaying(true)}
            style={{ position: 'relative', cursor: 'pointer', background: '#1A1A1B', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
              alt={video.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            <div style={{ position: 'relative', zIndex: 1, width: 72, height: 72, borderRadius: '50%', background: '#FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(255,140,0,0.5)' }}>
              <Play size={30} fill="white" color="white" style={{ marginLeft: 4 }} />
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', aspectRatio: '16/9' }}>
            <iframe
              key={video.id}
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&fs=1&cc_load_policy=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, border: 'none' }}
            />
            <button
              onClick={() => setPlaying(false)}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Playlist navigation */}
      <div style={{ maxWidth: 720, margin: '12px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <button onClick={prev} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #333', borderRadius: 8, padding: '6px 14px', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <ChevronLeft size={16} /> Prev
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {PLAYLIST.map((v, i) => (
            <button
              key={v.id}
              onClick={() => goTo(i)}
              style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === current ? '#FF8C00' : '#444', padding: 0 }}
              title={v.title}
            />
          ))}
        </div>

        <button onClick={next} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #333', borderRadius: 8, padding: '6px 14px', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}