import { useState } from 'react';
import { Play, X } from 'lucide-react';

export default function HomeVideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ background: '#111112', padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#aaa', fontStyle: 'italic', marginBottom: 16 }}>
        For your entertainment
      </p>

      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a2b', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {!playing ? (
          <div
            onClick={() => setPlaying(true)}
            style={{ position: 'relative', cursor: 'pointer', background: '#1A1A1B', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* YouTube thumbnail */}
            <img
              src="https://img.youtube.com/vi/UqXIA3Mymp4/maxresdefault.jpg"
              alt="Watch overview video"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            />
            {/* Dark overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            {/* Play button */}
            <div style={{ position: 'relative', zIndex: 1, width: 72, height: 72, borderRadius: '50%', background: '#FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(255,140,0,0.5)', transition: 'transform 0.2s' }}>
              <Play size={30} fill="white" color="white" style={{ marginLeft: 4 }} />
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', aspectRatio: '16/9' }}>
            <iframe
              src="https://www.youtube.com/embed/UqXIA3Mymp4?autoplay=1"
              title="SurfCoast Platform Overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            />
            <button
              onClick={() => setPlaying(false)}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
              title="Close video"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}