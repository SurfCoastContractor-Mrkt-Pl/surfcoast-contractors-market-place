import React from 'react';
import { usePalette } from '@/lib/PaletteContext';

// Replicate the palette application function
const PALETTES = {
  ocean: { name: 'Ocean' },
  ash: { name: 'Ash' },
  mist: { name: 'Mist' },
};

const PALETTE_COLORS = {
  ocean: {
    background: '210 20% 98%',
    foreground: '210 50% 8%',
    primary: '210 75% 38%',
    secondary: '173 58% 35%',
    muted: '210 15% 94%',
    mutedForeground: '210 50% 20%',
    accent: '25 95% 53%',
    border: '210 20% 82%',
    input: '210 20% 88%',
  },
  ash: {
    background: '0 0% 97%',
    foreground: '0 0% 15%',
    primary: '0 0% 25%',
    secondary: '0 0% 88%',
    muted: '0 0% 92%',
    mutedForeground: '0 0% 40%',
    accent: '25 95% 53%',
    border: '0 0% 82%',
    input: '0 0% 88%',
  },
  mist: {
    background: '220 15% 96%',
    foreground: '220 25% 12%',
    primary: '220 60% 45%',
    secondary: '220 20% 88%',
    muted: '220 15% 91%',
    mutedForeground: '220 20% 35%',
    accent: '25 95% 53%',
    border: '220 15% 80%',
    input: '220 15% 86%',
  },
};

export default function PaletteSwitcher() {
  const { palette, setPalette, PALETTES: contextPalettes } = usePalette();

  const handleClick = (paletteName) => {
    console.log('🎨 Switching palette to:', paletteName);
    setPalette(paletteName);
    try {
      sessionStorage.setItem('app_palette', paletteName);
    } catch (e) {
      console.warn('Could not save palette:', e.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      gap: 8,
      padding: 12,
      background: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }}>
      {Object.keys(contextPalettes).map((paletteName) => (
        <button
          key={paletteName}
          onClick={() => handleClick(paletteName)}
          style={{
            padding: '8px 14px',
            borderRadius: 4,
            border: palette === paletteName ? '2px solid #fbbf24' : '1px solid #666',
            background: palette === paletteName ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)',
            color: palette === paletteName ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >
          {contextPalettes[paletteName].name}
        </button>
      ))}
    </div>
  );
}