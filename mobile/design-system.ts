/**
 * PATHWAY MOBILE APP - OFFICIAL DESIGN SYSTEM & BRANDING
 * Color Palette, Typography, Motion, and Component Specifications
 */

// ============================================
// OFFICIAL COLOR PALETTE
// ============================================

export const pathwayColors = {
  // Core Brand Colors
  navy: '#0A1A2F', // Deepest, headers, nav, backgrounds
  blue: '#1E3A5F', // Buttons, active states, icons
  teal: '#1F6F78', // Highlights, accents, progress
  
  // Secondary Colors
  slateBlue: '#2C4A72', // Card backgrounds, tiles
  steelBlue: '#3E5C89', // Secondary buttons, inactive
  softTeal: '#4FA3A5', // Success states, positive feedback
  warmGray: '#A9B4C2', // Text labels, dividers
  
  // Utility Colors
  success: '#3BB273', // Completed nodes, approvals
  warning: '#E8A23A', // Pending tasks, attention
  error: '#D9534F', // Failed uploads, errors
  
  // Background Colors
  darkCanvas: '#0F1F33', // App background
  overlayBlack: 'rgba(0, 0, 0, 0.35)', // Over dynamic backgrounds
  frostedGlass: 'rgba(255, 255, 255, 0.08)', // Card backgrounds
  
  // Text Colors
  primaryText: '#E8EEF4', // Main text
  secondaryText: '#C7D1DD', // Descriptions
  mutedText: '#8A96A5', // Inactive states
};

// ============================================
// MOTION & ANIMATION SPEC
// ============================================

export const motionSpec = {
  easing: {
    default: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)', // easeInOutCubic
    exit: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // easeOutQuad
    entrance: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // easeOutBack
  },
  duration: {
    micro: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    cinematic: 600,
    extended: 700,
  },
  parallax: 0.3, // Background moves at 30% of scroll speed
};

export const animationSequences = {
  // Dashboard Task Cards
  taskCardEnter: {
    duration: 150,
    from: { opacity: 0, translateY: 10 },
    to: { opacity: 1, translateY: 0 },
    easing: motionSpec.easing.default,
  },
  taskCardHover: {
    duration: 200,
    scale: 1.02,
  },
  
  // Pathway Roadmap
  nodeReveal: {
    duration: 300,
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
  },
  connectorLineDraw: {
    duration: 300,
    type: 'stroke',
  },
  nodeCompleted: {
    duration: 1000,
    keyframes: [
      { opacity: 0.8 },
      { opacity: 1 },
      { opacity: 0.8 },
    ],
    loop: true,
  },
  
  // Cinematic Map Navigation
  mapNavigationSequence: [
    { name: 'fadeIn', duration: 200 },
    { name: 'autoZoomDestination', duration: 600 },
    { name: 'zoomOutReveal', duration: 500 },
    { name: 'panToUserLocation', duration: 400 },
    { name: 'zoomShowBothPoints', duration: 600 },
    { name: 'drawRouteLine', duration: 700, color: '#1F6F78' },
    { name: 'displayConfirm', duration: 300 },
  ],
  
  // Tab Switching
  tabSwitch: {
    duration: 250,
    horizontal: true,
    backgroundCrossfade: true,
  },
  
  // Dynamic Backgrounds
  backgroundCrossfade: {
    duration: 300,
    to: 500,
    blurIncreaseOnTransition: true,
  },
};

// ============================================
// COMPONENT SPECIFICATIONS
// ============================================

export const componentSpecs = {
  taskCard: {
    padding: 16,
    borderRadius: 14,
    shadow: 'subtle-soft-wide',
    background: pathwayColors.frostedGlass,
    layout: 'auto', // Auto-layout
  },
  
  nodeCard: {
    size: { min: 28, max: 36 },
    borderRadius: '50%',
    connectorThickness: 3,
    verticalSpacing: { min: 48, max: 64 },
  },
  
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
    label: {
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: 0.4,
    },
  },
  
  microIcons: {
    upload: 'cloud-arrow',
    call: 'phone',
    map: 'pin',
    open: 'arrow-right',
  },
};

// ============================================
// DYNAMIC BACKGROUND CONFIGURATION
// ============================================

export const dynamicBackgroundRules = {
  opacity: { min: 0.15, max: 0.25 },
  blur: { min: 12, max: 18 },
  brightness: 'slightly-dimmed',
  parallax: 0.3,
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
    pathway: {
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
};

// ============================================
// INTERACTION PATTERNS
// ============================================

export const interactionPatterns = {
  taskTap: {
    action: 'openPathwayTabAtNode',
    animation: 'slideInFromRight',
  },
  
  phoneTap: {
    action: 'openNativeDialer',
    dialingNumber: 'fromTaskCard',
  },
  
  mapTap: {
    action: 'cinemaicMapNavigation',
    sequence: animationSequences.mapNavigationSequence,
  },
  
  uploadTap: {
    action: 'openCameraOrFilePicker',
    acceptedTypes: ['image', 'pdf'],
    uploadIndicator: 'progressBar',
  },
  
  nodeTap: {
    action: 'expandNodeAndShowDetails',
    animation: 'popExpand',
    detailPanel: 'slideUpFromBottom',
  },
};
