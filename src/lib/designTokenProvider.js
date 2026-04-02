/**
 * Design Token Provider
 * Global utility to apply design tokens to pages without individual modifications
 * Provides helper functions and classes that auto-style common elements
 */

export const applyDesignTokens = {
  /**
   * Get button class name based on variant
   */
  button: (variant = 'primary') => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
    };
    return variants[variant] || variants.primary;
  },

  /**
   * Get card class name based on variant
   */
  card: (variant = 'base') => {
    const variants = {
      base: 'card-base',
      elevated: 'card-elevated',
      featured: 'card-featured',
    };
    return variants[variant] || variants.base;
  },

  /**
   * Get input class name
   */
  input: () => 'input-base',

  /**
   * Get badge class name based on type
   */
  badge: (type = 'pill') => {
    const types = {
      pill: 'badge-pill',
      success: 'badge-success',
    };
    return types[type] || types.pill;
  },

  /**
   * Get status message class name
   */
  message: (status = 'error') => {
    const statuses = {
      error: 'error-message',
      success: 'success-message',
      warning: 'warning-message',
    };
    return statuses[status] || statuses.error;
  },

  /**
   * Get section padding class
   */
  section: () => 'section-padded',

  /**
   * Get trust item class
   */
  trustItem: () => 'trust-item',

  /**
   * Inline style objects for direct use in styled components
   */
  inline: {
    buttonPrimary: {
      backgroundColor: '#ea580c',
      color: '#ffffff',
      padding: '12px 32px',
      borderRadius: '8px',
      fontWeight: 700,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: '#2176cc',
      padding: '12px 24px',
      borderRadius: '8px',
      border: '2px solid #2176cc',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    cardBase: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
    },
    inputBase: {
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#111827',
      fontSize: '16px',
    },
    textHeading: {
      color: '#111827',
      fontWeight: 700,
    },
    textBody: {
      color: '#374151',
    },
    textMuted: {
      color: '#4b5563',
    },
  },
};

/**
 * Hook to get consistent design token values
 * Usage: const tokens = useDesignTokens();
 * Returns: { colors, buttons, cards, etc. }
 */
export const useDesignTokens = () => {
  return {
    colors: {
      accent: '#ea580c',
      primary: '#2176cc',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#f59e0b',
      gray100: '#f9fafb',
      gray200: '#f3f4f6',
      gray300: '#e5e7eb',
      gray600: '#4b5563',
      gray700: '#374151',
      gray900: '#111827',
      white: '#ffffff',
    },
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
      md: '0 10px 25px rgba(0, 0, 0, 0.08)',
      lg: '0 20px 50px rgba(0, 0, 0, 0.12)',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
  };
};

/**
 * CSS class builder for complex combinations
 * Usage: classBuilder(['card-base', condition && 'hover:shadow-lg'])
 */
export const classBuilder = (classes) => {
  return classes.filter(Boolean).join(' ');
};