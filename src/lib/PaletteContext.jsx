import React, { createContext, useContext, useEffect, useState } from 'react';

const PaletteContext = createContext();

const PALETTES = {
  ocean: {
    name: 'Ocean',
    background: '210 20% 98%',
    foreground: '210 50% 8%',
    card: '0 0% 100%',
    cardForeground: '210 50% 8%',
    primary: '210 75% 38%',
    secondary: '173 58% 35%',
    muted: '210 15% 94%',
    mutedForeground: '210 50% 20%',
    accent: '25 95% 53%',
    border: '210 20% 82%',
    input: '210 20% 88%',
    sidebarBackground: '210 30% 98%',
    sidebarForeground: '210 50% 8%',
  },
  ash: {
    name: 'Ash',
    background: '0 0% 97%',
    foreground: '0 0% 15%',
    card: '0 0% 100%',
    cardForeground: '0 0% 15%',
    primary: '0 0% 25%',
    secondary: '0 0% 88%',
    muted: '0 0% 92%',
    mutedForeground: '0 0% 40%',
    accent: '25 95% 53%',
    border: '0 0% 82%',
    input: '0 0% 88%',
    sidebarBackground: '0 0% 97%',
    sidebarForeground: '0 0% 15%',
  },
  mist: {
    name: 'Mist',
    background: '220 15% 96%',
    foreground: '220 25% 12%',
    card: '0 0% 100%',
    cardForeground: '220 25% 12%',
    primary: '220 60% 45%',
    secondary: '220 20% 88%',
    muted: '220 15% 91%',
    mutedForeground: '220 20% 35%',
    accent: '25 95% 53%',
    border: '220 15% 80%',
    input: '220 15% 86%',
    sidebarBackground: '220 15% 96%',
    sidebarForeground: '220 25% 12%',
  },
};

export function PaletteProvider({ children }) {
  const [palette, setPalette] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage for saved palette
    const savedPalette = sessionStorage.getItem('app_palette');
    
    if (savedPalette && PALETTES[savedPalette]) {
      setPalette(savedPalette);
    } else {
      // Random selection if not saved
      const palettes = Object.keys(PALETTES);
      const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
      sessionStorage.setItem('app_palette', randomPalette);
      setPalette(randomPalette);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!palette) return;

    // Apply palette to CSS variables
    const selectedPalette = PALETTES[palette];
    const root = document.documentElement;

    Object.entries(selectedPalette).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
  }, [palette]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <PaletteContext.Provider value={{ palette, setPalette, PALETTES }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error('usePalette must be used within PaletteProvider');
  }
  return context;
}