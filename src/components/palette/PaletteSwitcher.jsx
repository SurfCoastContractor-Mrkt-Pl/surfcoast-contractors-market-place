import React from 'react';
import { usePalette } from '@/lib/PaletteContext';

export default function PaletteSwitcher() {
  const { palette, setPalette, PALETTES } = usePalette();

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      gap: 8,
      padding: 12,
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
    }}>
      {Object.keys(PALETTES).map((paletteName) => (
        <button
          key={paletteName}
          onClick={() => {
            console.log('Manually switching to palette:', paletteName);
            setPalette(paletteName);
            try {
              sessionStorage.setItem('app_palette', paletteName);
              console.log('Palette saved to sessionStorage');
            } catch (e) {
              console.warn('Could not save palette:', e.message);
            }
          }}
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            border: palette === paletteName ? '2px solid #fbbf24' : '1px solid #4b5563',
            background: palette === paletteName ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)',
            color: palette === paletteName ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {PALETTES[paletteName].name}
        </button>
      ))}
    </div>
  );
}