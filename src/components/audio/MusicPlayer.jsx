import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Play, Pause, X, Music } from 'lucide-react';

export default function MusicPlayer({ open, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(20); // 0-100
  const iframeRef = useRef(null);

  const sendCommand = (func, args = '') => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );
  };

  const togglePlay = () => {
    if (playing) {
      sendCommand('pauseVideo');
      setPlaying(false);
    } else {
      sendCommand('playVideo');
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (muted) {
      sendCommand('unMute');
      setMuted(false);
    } else {
      sendCommand('mute');
      setMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    sendCommand('setVolume', [val]);
    if (val === 0) {
      setMuted(true);
    } else if (muted) {
      sendCommand('unMute');
      setMuted(false);
    }
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  if (!open) return (
    // Always render the iframe so music plays in background
    <iframe
      ref={iframeRef}
      src="https://www.youtube.com/embed/6AL7cVAiPdg?autoplay=1&loop=1&playlist=6AL7cVAiPdg&enablejsapi=1&controls=0&mute=0"
      allow="autoplay"
      style={{ position: 'fixed', width: 0, height: 0, border: 'none', opacity: 0, pointerEvents: 'none' }}
      title="background-music"
    />
  );

  return (
    <>
      {/* Hidden iframe — always present */}
      <iframe
        ref={iframeRef}
        src="https://www.youtube.com/embed/6AL7cVAiPdg?autoplay=1&loop=1&playlist=6AL7cVAiPdg&enablejsapi=1&controls=0&mute=0"
        allow="autoplay"
        style={{ position: 'fixed', width: 0, height: 0, border: 'none', opacity: 0, pointerEvents: 'none' }}
        title="background-music"
      />

      {/* Player panel */}
      <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">Now Playing</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Song info */}
          <div className="text-center">
            <p className="font-semibold text-slate-800 text-sm">You Get What You Give</p>
            <p className="text-slate-500 text-xs">The New Radicals</p>
          </div>

          {/* Animated wave when playing */}
          <div className="flex items-end justify-center gap-0.5 h-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full bg-amber-400 transition-all ${playing && !muted ? 'animate-pulse' : ''}`}
                style={{
                  height: playing && !muted ? `${Math.random() * 24 + 8}px` : '4px',
                  animationDelay: `${i * 80}ms`,
                  animationDuration: `${600 + i * 100}ms`,
                }}
              />
            ))}
          </div>

          {/* Play / Pause */}
          <div className="flex justify-center">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md transition-colors"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </div>

          {/* Volume row */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-slate-500 hover:text-amber-500 transition-colors">
              <VolumeIcon className="w-5 h-5" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1.5 rounded-full accent-amber-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400 w-8 text-right">{muted ? 0 : volume}%</span>
          </div>
        </div>
      </div>
    </>
  );
}