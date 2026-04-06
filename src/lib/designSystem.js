/**
 * Design System — Color Tokens & Typography
 * Use these tokens instead of hardcoded colors for consistency across the app
 */

export const Colors = {
  // Core Palette
  deepSlate: '#555556',           // Primary background
  safetyOrange: '#FF8C00',        // Primary action/accent
  electricCobalt: '#2E5BFF',      // Secondary action/highlight
  gunmetalSteel: '#404040',       // Accent borders
  titaniumWhite: '#FFFFFF',       // Text on dark
  
  // Semantic
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--accent))',
  border: 'hsl(var(--border))',
};

export const Typography = {
  // Font families (set in index.css)
  serif: {
    display: 'font-family: "Playfair Display", serif',
    body: 'font-family: "Lora", serif',
  },
  sans: {
    display: 'font-family: "Inter", sans-serif',
    body: 'font-family: "Inter", sans-serif',
  },
  mono: {
    label: 'fontFamily: "monospace", fontWeight: 700, fontStyle: "italic"',
  },
};

export const Shadows = {
  card: '3px 3px 0px #5C3500',           // Amber shadow (from Home)
  goldGlow: '3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)',
  goldGlowSm: '0 0 14px 3px rgba(255, 180, 0, 0.3)',
  purpleBlueGlow: '0 0 18px 5px rgba(100, 80, 220, 0.45)',
};

export const BorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

/**
 * Reusable CSS-in-JS helpers
 */
export const createCardStyle = (withHover = true) => ({
  background: Colors.card,
  border: `0.5px solid ${Colors.border}`,
  borderRadius: BorderRadius.lg,
  boxShadow: Shadows.card,
  transition: withHover ? 'box-shadow 0.2s ease' : 'none',
  ...(withHover && {
    '&:hover': {
      boxShadow: Shadows.goldGlow,
    },
  }),
});

export const createButtonStyle = (variant = 'primary') => {
  const styles = {
    primary: {
      background: Colors.safetyOrange,
      color: Colors.titaniumWhite,
      border: 'none',
      padding: '12px 32px',
      borderRadius: BorderRadius.md,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        background: '#E67E00',
        boxShadow: `0 4px 12px rgba(255, 140, 0, 0.4)`,
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: Colors.safetyOrange,
      padding: '12px 24px',
      borderRadius: BorderRadius.md,
      border: `2px solid ${Colors.safetyOrange}`,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: 'rgba(255, 140, 0, 0.1)',
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#E5E5E5',
      padding: '8px 16px',
      borderRadius: BorderRadius.full,
      border: `1px solid #505050`,
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: 'rgba(255, 140, 0, 0.1)',
        borderColor: Colors.safetyOrange,
      },
    },
  };
  return styles[variant] || styles.primary;
};