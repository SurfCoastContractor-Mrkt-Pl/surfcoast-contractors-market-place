/**
 * Design Tokens - Extracted from Home landing page
 * Central source of truth for consistent styling across all pages
 */

export const designTokens = {
  // ============ COLORS ============
  colors: {
    // Primary Brand - Blue
    primary: {
      DEFAULT: '#2176cc',
      dark: '#1d4ed8',
      light: '#dbeafe',
    },
    // Secondary Brand - Orange
    accent: {
      DEFAULT: '#ea580c',
      dark: '#d94600',
      light: '#fed7aa',
    },
    // Neutrals
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      600: '#4b5563',
      700: '#374151',
      900: '#111827',
    },
    // Status
    success: '#16a34a',
    success_dark: '#166534',
    background: '#ffffff',
    surface: '#f9fafb',
  },

  // ============ TYPOGRAPHY ============
  typography: {
    // Font families
    fontFamily: {
      base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      serif: "'Lora', serif",
    },
    // Font sizes
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    // Line heights
    lineHeight: {
      tight: 1.2,
      snug: 1.4,
      normal: 1.6,
      relaxed: 1.8,
    },
  },

  // ============ BUTTONS ============
  buttons: {
    // Primary button (orange)
    primary: {
      bg: '#ea580c',
      bgHover: '#d94600',
      text: '#ffffff',
      padding: '12px 32px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 700,
      className: 'px-8 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all',
    },
    // Secondary button (blue outline)
    secondary: {
      bg: 'transparent',
      border: '#2176cc',
      text: '#2176cc',
      bgHover: '#eff6ff',
      borderHover: '#2176cc',
      padding: '12px 24px',
      borderRadius: '8px',
      className: 'px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all',
    },
    // Tertiary button (outline gray)
    tertiary: {
      bg: 'transparent',
      border: '#d1d5db',
      text: '#4b5563',
      bgHover: '#f9fafb',
      borderHover: '#d1d5db',
      padding: '8px 16px',
      borderRadius: '9999px',
      className: 'px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-orange-50 hover:border-orange-300 transition-all',
    },
  },

  // ============ CARDS & CONTAINERS ============
  cards: {
    base: {
      bg: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      shadow: 'hover:shadow-lg transition-shadow',
      className: 'bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow',
    },
    elevated: {
      bg: '#f9fafb',
      border: 'none',
      borderRadius: '12px',
      padding: '24px',
      shadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    featured: {
      bg: 'linear-gradient(to bottom right, #fed7aa, #fff7ed)',
      border: '2px solid #fed7aa',
      borderRadius: '16px',
      padding: '32px',
    },
  },

  // ============ SPACING & LAYOUT ============
  spacing: {
    // Vertical spacing
    sectionPaddingY: 'py-16 md:py-24',
    sectionPaddingX: 'px-4 sm:px-6 lg:px-8',
    contentMaxWidth: 'max-w-7xl',
    narrowMaxWidth: 'max-w-4xl',
    // Horizontal rhythm
    gapSmall: 'gap-3',
    gapMedium: 'gap-4',
    gapLarge: 'gap-8',
    gapXL: 'gap-12',
  },

  // ============ INPUTS & FORMS ============
  inputs: {
    base: {
      bg: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '12px 16px',
      text: '#111827',
      placeholder: '#9ca3af',
      focusBorder: '#ea580c',
      focusRing: '#fed7aa',
      className: 'flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100',
    },
  },

  // ============ NAVIGATION & HEADERS ============
  nav: {
    height: '64px',
    bg: 'rgba(255, 255, 255, 0.95)',
    borderBottom: '1px solid #dbeafe',
    backdrop: 'blur(12px)',
  },

  // ============ BADGES & LABELS ============
  badges: {
    pill: {
      bg: '#fed7aa',
      text: '#92400e',
      borderRadius: '9999px',
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: 700,
      className: 'px-3 py-1 rounded-full text-xs font-bold text-orange-600 bg-orange-100',
    },
  },

  // ============ SECTIONS & BACKGROUNDS ============
  sections: {
    light: 'bg-white',
    muted: 'bg-gray-50',
    gradient_soft: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 60%, #fff7ed 100%)',
  },

  // ============ TRUST SIGNALS ============
  trustSignals: {
    icon: {
      size: '20px',
      color: '#ea580c',
    },
    text: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
    },
  },

  // ============ TEXT STYLES ============
  text: {
    // Headings
    h1: 'text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight',
    h2: 'text-3xl md:text-4xl font-bold text-gray-900 mb-4',
    h3: 'text-2xl font-bold text-gray-900',
    h4: 'text-lg font-bold text-gray-900',
    // Body
    bodyLarge: 'text-base text-gray-700 leading-relaxed',
    bodyBase: 'text-base text-gray-600',
    bodySm: 'text-sm text-gray-600',
    // Accent text
    accentOrange: 'text-orange-600',
    accentBlue: 'text-blue-600',
  },

  // ============ RESPONSIVE BREAKPOINTS ============
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

/**
 * Utility: Get button className
 */
export const getButtonClass = (variant = 'primary') => {
  return designTokens.buttons[variant]?.className || designTokens.buttons.primary.className;
};

/**
 * Utility: Get section padding
 */
export const getSectionClass = () => {
  return `${designTokens.spacing.sectionPaddingY} ${designTokens.spacing.sectionPaddingX}`;
};

/**
 * Utility: Get card base styles
 */
export const getCardClass = () => {
  return designTokens.cards.base.className;
};