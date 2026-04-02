import React, { createContext, useContext, useEffect, useState } from 'react';

const PaletteContext = createContext();

const PALETTES = {
  ocean: {
    name: 'Ocean',
    background: '210 20% 98%',
    foreground: '210 50% 8%',
    card: '0 0% 100%',
    cardForeground: '210 50% 8%',
    popover: '0 0% 100%',
    popoverForeground: '210 50% 8%',
    primary: '210 75% 38%',
    primaryForeground: '0 0% 100%',
    secondary: '173 58% 35%',
    secondaryForeground: '0 0% 100%',
    muted: '210 15% 94%',
    mutedForeground: '210 50% 20%',
    accent: '25 95% 53%',
    accentForeground: '0 0% 100%',
    destructive: '0 84% 50%',
    destructiveForeground: '0 0% 100%',
    border: '210 20% 82%',
    input: '210 20% 88%',
    ring: '210 75% 38%',
    sidebarBackground: '210 30% 98%',
    sidebarForeground: '210 50% 8%',
    sidebarPrimary: '210 75% 38%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '173 58% 35%',
    sidebarAccentForeground: '0 0% 100%',
    sidebarBorder: '210 20% 82%',
    sidebarRing: '210 75% 38%',
  },
  ash: {
    name: 'Ash',
    background: '0 0% 97%',
    foreground: '0 0% 15%',
    card: '0 0% 100%',
    cardForeground: '0 0% 15%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 15%',
    primary: '0 0% 25%',
    primaryForeground: '0 0% 100%',
    secondary: '0 0% 88%',
    secondaryForeground: '0 0% 15%',
    muted: '0 0% 92%',
    mutedForeground: '0 0% 40%',
    accent: '25 95% 53%',
    accentForeground: '0 0% 100%',
    destructive: '0 84% 50%',
    destructiveForeground: '0 0% 100%',
    border: '0 0% 82%',
    input: '0 0% 88%',
    ring: '0 0% 25%',
    sidebarBackground: '0 0% 97%',
    sidebarForeground: '0 0% 15%',
    sidebarPrimary: '0 0% 25%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '0 0% 88%',
    sidebarAccentForeground: '0 0% 15%',
    sidebarBorder: '0 0% 82%',
    sidebarRing: '0 0% 25%',
  },
  mist: {
    name: 'Mist',
    background: '220 15% 96%',
    foreground: '220 25% 12%',
    card: '0 0% 100%',
    cardForeground: '220 25% 12%',
    popover: '0 0% 100%',
    popoverForeground: '220 25% 12%',
    primary: '220 60% 45%',
    primaryForeground: '0 0% 100%',
    secondary: '220 20% 88%',
    secondaryForeground: '220 25% 12%',
    muted: '220 15% 91%',
    mutedForeground: '220 20% 35%',
    accent: '25 95% 53%',
    accentForeground: '0 0% 100%',
    destructive: '0 84% 50%',
    destructiveForeground: '0 0% 100%',
    border: '220 15% 80%',
    input: '220 15% 86%',
    ring: '220 60% 45%',
    sidebarBackground: '220 15% 96%',
    sidebarForeground: '220 25% 12%',
    sidebarPrimary: '220 60% 45%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '220 20% 88%',
    sidebarAccentForeground: '220 25% 12%',
    sidebarBorder: '220 15% 80%',
    sidebarRing: '220 60% 45%',
  },
};

function applyPaletteToDOM(paletteName) {
  const selectedPalette = PALETTES[paletteName];
  const root = document.documentElement;

  // Remove dark class that might override
  root.classList.remove('dark');

  // Apply all CSS variables directly to root element style attribute
  Object.entries(selectedPalette).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });

  // Preserve logo gradients
  root.style.setProperty('--gradient-brand', 'linear-gradient(135deg, #1e5a96 0%, #2176cc 50%, #f97316 100%)');
  root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #ea580c 100%)');

  console.log('✓ Palette applied to DOM:', paletteName);
}

export function PaletteProvider({ children }) {
  const [palette, setPalette] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🎨 Palette system initializing...');
    
    try {
      let savedPalette = null;
      let sessionStorageAvailable = true;
      
      try {
        savedPalette = sessionStorage.getItem('app_palette');
        console.log('✓ sessionStorage available');
      } catch (e) {
        console.warn('⚠️ sessionStorage blocked:', e.message);
        sessionStorageAvailable = false;
      }
      
      let selectedPalette = null;
      
      if (savedPalette && PALETTES[savedPalette]) {
        console.log('✓ Using saved palette:', savedPalette);
        selectedPalette = savedPalette;
      } else {
        const palettes = Object.keys(PALETTES);
        selectedPalette = palettes[Math.floor(Math.random() * palettes.length)];
        console.log('✓ Random palette selected:', selectedPalette);
        
        if (sessionStorageAvailable) {
          try {
            sessionStorage.setItem('app_palette', selectedPalette);
          } catch (e) {
            console.warn('⚠️ Could not save palette:', e.message);
          }
        }
      }

      // Apply immediately before render
      applyPaletteToDOM(selectedPalette);
      setPalette(selectedPalette);
      setIsLoading(false);
    } catch (e) {
      console.error('❌ Palette error:', e);
      const palettes = Object.keys(PALETTES);
      const selectedPalette = palettes[Math.floor(Math.random() * palettes.length)];
      applyPaletteToDOM(selectedPalette);
      setPalette(selectedPalette);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!palette) return;
    console.log('🎨 Palette updated:', palette);
    applyPaletteToDOM(palette);
  }, [palette]);

  if (isLoading) {
    return null;
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