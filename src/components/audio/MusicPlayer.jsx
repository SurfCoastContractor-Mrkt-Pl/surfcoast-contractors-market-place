import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';

export default function MusicPlayer({ open, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (playing) {
        audioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
      }
    }
  }, [volume, playing]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log('Play error:', err));
      }
      setPlaying(!playing);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="https://commondatastorage.googleapis.com/codeskulptor-assets/Evilnessvan_-_01_-_Quotes.mp3"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Minimalist fixed bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Music className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">A Kind of Magic • Queen</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-24 h-1 rounded-full accent-white cursor-pointer"
            />

            <span className="text-xs w-6 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
    </>
  );
}