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

export function PaletteProvider({ children }) {
  const [palette, setPalette] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Palette system loaded');
    
    try {
      // Check sessionStorage for saved palette
      let savedPalette = null;
      let sessionStorageAvailable = true;
      
      try {
        savedPalette = sessionStorage.getItem('app_palette');
        console.log('sessionStorage available, savedPalette:', savedPalette);
      } catch (e) {
        console.warn('sessionStorage unavailable:', e.message);
        sessionStorageAvailable = false;
      }
      
      if (savedPalette && PALETTES[savedPalette]) {
        console.log('Using saved palette:', savedPalette);
        setPalette(savedPalette);
      } else {
        // Random selection if not saved
        const palettes = Object.keys(PALETTES);
        const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
        console.log('Selected random palette:', randomPalette);
        
        if (sessionStorageAvailable) {
          try {
            sessionStorage.setItem('app_palette', randomPalette);
            console.log('Saved palette to sessionStorage');
          } catch (e) {
            console.warn('Could not save to sessionStorage:', e.message);
          }
        }
        setPalette(randomPalette);
      }
    } catch (e) {
      console.error('Palette initialization error:', e);
      const palettes = Object.keys(PALETTES);
      const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
      console.log('Fallback palette selected:', randomPalette);
      setPalette(randomPalette);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!palette) return;

    console.log('Applying palette:', palette);

    // Apply palette to CSS variables
    const selectedPalette = PALETTES[palette];
    const root = document.documentElement;

    // Remove any .dark class that might be overriding palette
    root.classList.remove('dark');
    console.log('.dark class removed from root');

    // Apply theme colors — but preserve logo gradients
    Object.entries(selectedPalette).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // Explicitly preserve logo gradient across all themes
    root.style.setProperty('--gradient-brand', 'linear-gradient(135deg, #1e5a96 0%, #2176cc 50%, #f97316 100%)');
    root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #ea580c 100%)');
    
    console.log('Palette CSS variables applied:', {
      background: root.style.getPropertyValue('--background'),
      foreground: root.style.getPropertyValue('--foreground'),
      primary: root.style.getPropertyValue('--primary'),
      palette: palette,
    });
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