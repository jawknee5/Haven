/**
 * HAVEN GENESIS - OFFICIAL DESIGN SYSTEM
 * Typography, Spacing, Iconography, and Component Specifications
 */

// ============================================
// TYPOGRAPHY SPEC
// ============================================

export const typography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", monospace',
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSizes: {
    appTitle: { size: '28px', weight: 700 },
    sectionHeader: { size: '22px', weight: 600 },
    cardTitle: { size: '18px', weight: 500 },
    bodyText: { size: '15px', weight: 400 },
    secondaryText: { size: '13px', weight: 300 },
    buttonLabel: { size: '16px', weight: 600 },
    nodeLabel: { size: '18px', weight: 700 },
    microLabel: { size: '12px', weight: 400 },
  },
  lineHeight: {
    body: 1.45,
    titles: 1.2,
    cards: 1.35,
  },
  letterSpacing: {
    titles: '0.2px',
    body: '0px',
    buttons: '0.4px',
  },
};

// ============================================
// SPACING SCALE
// ============================================

export const spacing = {
  xs: '4px',
  s: '8px',
  m: '12px',
  l: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
};

export const componentPadding = {
  card: '16px',
  buttonVertical: '12px',
  buttonHorizontal: '20px',
  toolTile: '20px',
  nodeDetailPanel: '24px',
};

export const grid = {
  columns: 12,
  gutters: '16px',
  margins: '24px',
};

export const touchTargets = {
  minimum: '48px',
  ideal: '56px',
};

export const nodeSpacing = {
  verticalMin: '48px',
  verticalMax: '64px',
  connectorThickness: '3px',
  nodeDiameterMin: '28px',
  nodeDiameterMax: '36px',
};

// ============================================
// ICONOGRAPHY SPEC
// ============================================

export const iconography = {
  strokeWeight: {
    primary: '1.75px',
    emphasis: '2px',
  },
  style: 'rounded-line',
  colors: {
    active: '#1F6F78', // Primary Teal
    inactive: '#A9B4C2', // Warm Gray
    error: '#D9534F', // Error Red
    success: '#3BB273', // Success Green
  },
  icons: {
    dashboard: 'compass',
    navigation: 'connected-nodes',
    resources: 'book',
    tools: 'wrench',
    pack: 'backpack',
    profile: 'user-silhouette',
    upload: 'cloud-arrow',
    call: 'phone',
    map: 'pin',
    open: 'arrow-right',
  },
};

// ============================================
// DYNAMIC BACKGROUND IMAGE RULES
// ============================================

export const backgroundImages = {
  opacity: {
    min: 0.15,
    max: 0.25,
  },
  blur: {
    min: '12px',
    max: '18px',
  },
  brightness: 'slightly-dimmed',
  parallax: {
    scrollSpeed: 0.3,
  },
  transition: {
    duration: '300ms-500ms',
    type: 'crossfade',
    blurIncreaseOnTransition: true,
  },
  perTab: {
    dashboard: {
      type: 'civic-imagery',
      examples: ['city-skylines', 'community-centers', 'soft-gradients'],
    },
    navigation: {
      type: 'google-street-view',
      dynamic: 'destination-based',
      updates: 'as-user-scrolls-nodes',
    },
    resources: {
      type: 'government-buildings',
      includes: ['maps', 'service-icons'],
    },
    tools: {
      type: 'abstract-tech',
      includes: ['geometric-patterns'],
    },
    pack: {
      type: 'survival-book',
      examples: ['forest', 'mountains', 'campfires', 'wilderness'],
    },
  },
  rules: {
    noFaces: true,
    noIdentifiablePeople: true,
    noCopyrightedImagery: true,
    alwaysSubtle: true,
    alwaysSupportive: true,
  },
};

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  primary: {
    teal: '#1F6F78',
    darkTeal: '#0D3B3F',
    lightTeal: '#4A9FA9',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F5F7FA',
    warmGray: '#A9B4C2',
    darkGray: '#4A5568',
    darkestGray: '#1A202C',
  },
  semantic: {
    success: '#3BB273',
    error: '#D9534F',
    warning: '#F0AD4E',
    info: '#5BC0DE',
  },
  dark: {
    background: '#0F1419',
    surface: '#1A1F2E',
    surfaceLight: '#252C3F',
  },
};

// ============================================
// COMPONENT STYLING
// ============================================

export const components = {
  card: {
    borderRadius: '14px',
    padding: '16px',
    shadow: 'subtle-soft-wide',
    background: 'frosted-glass-white-8-opacity',
  },
  button: {
    borderRadius: '8px',
    padding: '12px 20px',
    minHeight: '48px',
    transition: '200ms',
  },
  input: {
    borderRadius: '8px',
    padding: '12px 16px',
    minHeight: '48px',
    focus: 'ring-2 ring-teal-500',
  },
  nodeCard: {
    size: '28px-36px',
    borderRadius: '50%',
    connectorThickness: '3px',
    spacing: '48px-64px',
  },
};

// ============================================
// TONE GUIDELINES
// ============================================

export const tone = {
  never: ['shouty', 'overly-playful', 'condescending'],
  always: ['clear', 'calm', 'guiding', 'trustworthy', 'friendly'],
  civic: true,
  modern: true,
  clean: true,
  legibleInDarkMode: true,
};
