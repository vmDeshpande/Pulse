/**
 * Premium CSS Utilities for Pulse
 * Defines reusable classes and animations for consistent luxury feel
 */

export const glassmorphism = {
  light: 'backdrop-blur-xl bg-white/5 border border-white/10',
  medium: 'backdrop-blur-xl bg-white/8 border border-white/15',
  dark: 'backdrop-blur-xl bg-white/12 border border-white/20',
};

export const shadows = {
  subtle: 'shadow-lg shadow-black/20',
  medium: 'shadow-xl shadow-black/30',
  deep: 'shadow-2xl shadow-black/40',
};

export const typography = {
  heading: 'font-light tracking-[0.2em] text-white',
  subheading: 'text-xs font-semibold text-white/80 uppercase tracking-widest',
  body: 'text-sm text-white/80',
  caption: 'text-xs text-white/60 font-light',
  mono: 'font-mono text-xs text-white/50',
};

export const transitions = {
  fast: 'transition-all duration-200',
  normal: 'transition-all duration-300',
  smooth: 'transition-all duration-500',
};

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
};

/**
 * Color system for layers
 */
export const layerColorSystem = {
  flights: {
    color: '#3b82f6',
    light: 'rgba(59, 130, 246, 0.2)',
    accent: 'text-blue-300',
  },
  earthquakes: {
    color: '#ef4444',
    light: 'rgba(239, 68, 68, 0.2)',
    accent: 'text-red-300',
  },
  wildfires: {
    color: '#f97316',
    light: 'rgba(249, 115, 22, 0.2)',
    accent: 'text-orange-300',
  },
  iss: {
    color: '#8b5cf6',
    light: 'rgba(139, 92, 246, 0.2)',
    accent: 'text-purple-300',
  },
};

/**
 * Responsive breakpoints for Pulse
 */
export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
  ultrawide: '1440px',
};

/**
 * Performance metrics for monitoring
 */
export const performanceThresholds = {
  fps: {
    excellent: 60,
    good: 50,
    acceptable: 30,
    poor: 0,
  },
  frameTime: {
    excellent: 16.7,
    good: 20,
    acceptable: 33,
    poor: 100,
  },
};
