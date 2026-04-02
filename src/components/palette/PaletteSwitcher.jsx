import React from 'react';
import { usePalette } from '@/lib/PaletteContext';

export default function PaletteSwitcher() {
  const { palette, setPalette, PALETTES } = usePalette();

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
      {Object.keys(PALETTES).map((paletteName) => (
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
          {PALETTES[paletteName].name}
        </button>
      ))}
    </div>
  );
}