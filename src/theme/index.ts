export const theme = {
  colors: {
    // Blueprint palette - dark navy base
    background: '#0a1929',
    surfacePrimary: '#1a2c47',
    surfaceSecondary: '#253348',
    border: '#3d5a80',
    borderLight: '#5a7fa3',
    borderDim: '#1f3a52',

    // Text
    text: '#e8f0fe',
    textSecondary: '#a8c5dd',
    textTertiary: '#7a92b3',
    textInverse: '#0a1929',

    // Primary & accent
    primary: '#2d8cf0', // Audio blue
    primaryDark: '#1e5aa8',
    primaryLight: '#5ba8f5',

    // Semantic
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#2d8cf0',

    // Department colors
    dept: {
      audio: '#2d8cf0',
      video: '#a855f7',
      lighting: '#eab308',
      scenic: '#22c55e',
      softgoods: '#ec4899',
      stagehands: '#f97316',
    },

    // Glow effects
    glowBlue: 'rgba(45, 140, 240, 0.3)',
    glowPurple: 'rgba(168, 85, 247, 0.3)',
    glowGreen: 'rgba(34, 197, 94, 0.3)',
  },

  typography: {
    families: {
      monospace: 'Menlo',
      sanSerif: 'Helvetica',
    },
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  borderRadius: {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 20,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    },
    glow: {
      shadowColor: '#2d8cf0',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  animations: {
    duration: {
      fast: 150,
      base: 200,
      slow: 300,
      slower: 500,
    },
  },
} as const;

export type Theme = typeof theme;
