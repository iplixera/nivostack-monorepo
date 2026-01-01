/**
 * NivoStack Website Branding Constants
 * 
 * Centralized configuration for brand names, colors, domains, and content.
 */

// Brand Names
export const BRAND = {
  name: 'NivoStack',
  tagline: 'Mobile App Monitoring & Configuration Platform',
  description: 'Complete mobile app monitoring and configuration platform. Track API calls, monitor logs, catch crashes, manage configurations, and mock APIs—all from one dashboard.',
  studio: 'NivoStack Studio',
  sdk: 'NivoStack SDK',
} as const;

// Domains
export const DOMAINS = {
  marketing: process.env.NEXT_PUBLIC_MARKETING_URL || 'https://nivostack.com',
  studio: process.env.NEXT_PUBLIC_STUDIO_URL || 'https://studio.nivostack.com',
  docs: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.nivostack.com',
  api: process.env.NEXT_PUBLIC_API_URL || 'https://api.nivostack.com',
  ingest: process.env.NEXT_PUBLIC_INGEST_URL || 'https://ingest.nivostack.com',
} as const;

// Brand Colors
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  accent: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#fbbf24',
    400: '#f59e0b',
    500: '#d97706',
    600: '#b45309',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },
} as const;

// Social Links
export const SOCIAL = {
  twitter: 'https://twitter.com/nivostack',
  github: 'https://github.com/nivostack',
  linkedin: 'https://linkedin.com/company/nivostack',
  discord: 'https://discord.gg/nivostack',
} as const;

// Contact Information
export const CONTACT = {
  email: 'hello@nivostack.com',
  support: 'support@nivostack.com',
  sales: 'sales@nivostack.com',
} as const;

